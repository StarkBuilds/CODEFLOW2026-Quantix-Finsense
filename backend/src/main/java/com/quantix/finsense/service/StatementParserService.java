package com.quantix.finsense.service;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.CSVParserBuilder;
import com.opencsv.exceptions.CsvException;
import com.quantix.finsense.exception.PdfEncryptedException;
import com.quantix.finsense.model.TransactionType;
import com.quantix.finsense.parser.ParsedTransaction;
import com.quantix.finsense.util.TransactionHashUtil;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StatementParserService {

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("dd-MM-yyyy"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("d/M/yyyy"),
        DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH)
    };

    /** Generic bank line: date, narration, amount, optional Dr/Cr. */
    private static final Pattern PDF_LINE_PATTERN = Pattern.compile(
            "^\\s*(?<date>\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\s+"
                    + "(?<narration>.+?)\\s+"
                    + "(?<amount>[\\d,]+\\.\\d{2})\\s*"
                    + "(?<crdr>Cr|Dr|CR|DR|Credit|Debit)?\\s*$",
            Pattern.CASE_INSENSITIVE);

    /**
     * Entry point — dispatches CSV vs PDF parsing.
     * 
     * @param file     the uploaded statement
     * @param password optional PDF password (null/blank if not encrypted)
     * @throws PdfEncryptedException if the PDF is locked and no valid password was given
     */
    public List<ParsedTransaction> parse(MultipartFile file, String password) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Uploaded file has no name");
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".csv")) {
            return parseCsv(file);
        }
        if (lower.endsWith(".pdf")) {
            return parsePdf(file, password);
        }
        throw new IllegalArgumentException("Unsupported file type. Upload a .csv or .pdf statement.");
    }

    /** Backward-compatible overload without password. */
    public List<ParsedTransaction> parse(MultipartFile file) throws IOException {
        return parse(file, null);
    }

    private List<ParsedTransaction> parseCsv(MultipartFile file) throws IOException {
        try (CSVReader reader = new CSVReaderBuilder(
                        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))
                .withCSVParser(new CSVParserBuilder().build())
                .build()) {
            List<String[]> rows = reader.readAll();
            if (rows.isEmpty()) {
                return List.of();
            }

            int startRow = 0;
            Map<String, Integer> columns = defaultCsvColumns();
            if (!looksLikeDate(rows.get(0)[0])) {
                columns = mapCsvHeaders(rows.get(0));
                startRow = 1;
            }

            List<ParsedTransaction> transactions = new ArrayList<>();
            for (int i = startRow; i < rows.size(); i++) {
                String[] row = rows.get(i);
                if (row.length == 0 || isBlankRow(row)) {
                    continue;
                }
                ParsedTransaction txn = columns.containsKey("drcr")
                        ? parseBankCsvRow(row, columns)
                        : parseCsvRow(row, columns);
                if (txn != null) {
                    transactions.add(txn);
                }
            }
            return transactions;
        } catch (CsvException ex) {
            throw new IOException("Invalid CSV statement format", ex);
        }
    }

    private ParsedTransaction parseCsvRow(String[] row, Map<String, Integer> columns) {
        Integer dateIdx = columns.get("date");
        Integer narrationIdx = columns.get("narration");
        if (dateIdx == null || narrationIdx == null || dateIdx >= row.length || narrationIdx >= row.length) {
            return null;
        }

        LocalDate date = parseDate(row[dateIdx].trim());
        if (date == null) {
            return null;
        }

        String narration = row[narrationIdx].trim();
        if (narration.isEmpty()) {
            return null;
        }

        BigDecimal amount = null;
        TransactionType type = null;

        Integer debitIdx = columns.get("debit");
        Integer creditIdx = columns.get("credit");
        if (debitIdx != null && debitIdx < row.length && !row[debitIdx].isBlank()) {
            amount = parseAmount(row[debitIdx]);
            type = TransactionType.DEBIT;
        } else if (creditIdx != null && creditIdx < row.length && !row[creditIdx].isBlank()) {
            amount = parseAmount(row[creditIdx]);
            type = TransactionType.CREDIT;
        } else {
            Integer amountIdx = columns.get("amount");
            if (amountIdx == null || amountIdx >= row.length) {
                return null;
            }
            amount = parseAmount(row[amountIdx]);
            type = resolveType(columns.get("type"), row, amount);
        }

        if (amount == null || amount.signum() <= 0 || type == null) {
            return null;
        }
        return buildParsed(date, narration, amount, type);
    }

    /** Parses real bank export: date, DrCr, amount, mode, name, … */
    private ParsedTransaction parseBankCsvRow(String[] row, Map<String, Integer> columns) {
        Integer dateIdx = columns.get("date");
        Integer amountIdx = columns.get("amount");
        Integer drcrIdx = columns.get("drcr");
        if (dateIdx == null || amountIdx == null || drcrIdx == null) {
            return null;
        }
        if (dateIdx >= row.length || amountIdx >= row.length || drcrIdx >= row.length) {
            return null;
        }

        LocalDate date = parseDate(row[dateIdx].trim());
        if (date == null) {
            return null;
        }

        BigDecimal amount = parseAmount(row[amountIdx]);
        if (amount == null || amount.signum() <= 0) {
            return null;
        }

        String mode = cellAt(row, columns.get("mode"));
        String name = cellAt(row, columns.get("name"));
        String narration = buildNarration(mode, name);
        TransactionType type = resolveTypeFromCrDr(row[drcrIdx]);
        return buildParsed(date, narration, amount, type);
    }

    private String buildNarration(String mode, String name) {
        String m = mode == null ? "" : mode.trim();
        String n = name == null ? "" : name.trim();
        if (!m.isEmpty() && !n.isEmpty()) {
            return m + " " + n;
        }
        if (!n.isEmpty()) {
            return n;
        }
        return m.isEmpty() ? "BANK TRANSACTION" : m;
    }

    private String cellAt(String[] row, Integer index) {
        if (index == null || index >= row.length) {
            return "";
        }
        return row[index] == null ? "" : row[index].trim();
    }

    private ParsedTransaction buildParsed(
            LocalDate date, String narration, BigDecimal amount, TransactionType type) {
        String hash = TransactionHashUtil.compute(date, amount, narration);
        return new ParsedTransaction(date, narration, amount, type, hash);
    }

    private Map<String, Integer> defaultCsvColumns() {
        return Map.of(
                "date", 0,
                "narration", 1,
                "amount", 2,
                "type", 3);
    }

    private Map<String, Integer> mapCsvHeaders(String[] header) {
        Map<String, Integer> columns = new java.util.HashMap<>();
        for (int i = 0; i < header.length; i++) {
            String key = header[i].trim().toLowerCase(Locale.ROOT);
            switch (key) {
                case "date", "transaction_date", "txn_date", "value date" -> columns.put("date", i);
                case "narration", "description", "particulars", "details", "remark" -> columns.put("narration", i);
                case "amount", "transaction_amount" -> columns.put("amount", i);
                case "debit", "withdrawal", "dr" -> columns.put("debit", i);
                case "credit", "deposit", "cr" -> columns.put("credit", i);
                case "type", "dr/cr", "transaction_type" -> columns.put("type", i);
                case "drcr" -> columns.put("drcr", i);
                case "mode" -> columns.put("mode", i);
                case "name" -> columns.put("name", i);
                default -> {}
            }
        }
        if (!columns.containsKey("narration")) {
            columns.put("narration", 1);
        }
        if (!columns.containsKey("date")) {
            columns.put("date", 0);
        }
        if (!columns.containsKey("amount") && !columns.containsKey("debit")) {
            columns.put("amount", 2);
        }
        return columns;
    }

    /**
     * Parse PDF with optional password support.
     * If the PDF is encrypted and no/wrong password is given,
     * throws {@link PdfEncryptedException}.
     */
    private List<ParsedTransaction> parsePdf(MultipartFile file, String password) throws IOException {
        byte[] bytes = file.getBytes();

        PDDocument document;
        try {
            if (password != null && !password.isBlank()) {
                document = Loader.loadPDF(bytes, password);
            } else {
                document = Loader.loadPDF(bytes);
            }
        } catch (InvalidPasswordException ex) {
            throw new PdfEncryptedException("This PDF is password protected.", ex);
        }

        try (document) {
            // PDFBox may load an encrypted doc without exception in some cases,
            // but mark it as encrypted. Double-check accessibility.
            if (document.isEncrypted()) {
                try {
                    document.setAllSecurityToBeRemoved(true);
                } catch (Exception ignored) {
                    // If we can't decrypt, report it
                }
            }

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            List<ParsedTransaction> transactions = new ArrayList<>();
            for (String line : text.split("\\R")) {
                Matcher matcher = PDF_LINE_PATTERN.matcher(line.trim());
                if (!matcher.matches()) {
                    continue;
                }
                LocalDate date = parseDate(matcher.group("date"));
                if (date == null) {
                    continue;
                }
                String narration = matcher.group("narration").trim();
                BigDecimal amount = parseAmount(matcher.group("amount"));
                if (amount == null || amount.signum() <= 0) {
                    continue;
                }
                TransactionType type = resolveTypeFromCrDr(matcher.group("crdr"));
                transactions.add(buildParsed(date, narration, amount, type));
            }
            return transactions;
        }
    }

    private TransactionType resolveType(Integer typeIdx, String[] row, BigDecimal amount) {
        if (typeIdx != null && typeIdx < row.length && !row[typeIdx].isBlank()) {
            return resolveTypeFromCrDr(row[typeIdx]);
        }
        // Single amount column with no Dr/Cr hint — treat as debit unless explicitly negative.
        return TransactionType.DEBIT;
    }

    private TransactionType resolveTypeFromCrDr(String raw) {
        if (raw == null || raw.isBlank()) {
            return TransactionType.DEBIT;
        }
        String value = raw.trim().toLowerCase(Locale.ROOT);
        if (value.startsWith("cr") || value.contains("credit")) {
            return TransactionType.CREDIT;
        }
        if (value.startsWith("db") || value.startsWith("dr") || value.contains("debit")) {
            return TransactionType.DEBIT;
        }
        return TransactionType.DEBIT;
    }

    private LocalDate parseDate(String raw) {
        String value = raw.trim();
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
                // try next format
            }
        }
        return null;
    }

    private BigDecimal parseAmount(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String normalized = raw.trim().replace(",", "");
        try {
            BigDecimal amount = new BigDecimal(normalized);
            return amount.signum() < 0 ? amount.abs() : amount;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean looksLikeDate(String value) {
        return value != null && parseDate(value) != null;
    }

    private boolean isBlankRow(String[] row) {
        for (String cell : row) {
            if (cell != null && !cell.isBlank()) {
                return false;
            }
        }
        return true;
    }
}
