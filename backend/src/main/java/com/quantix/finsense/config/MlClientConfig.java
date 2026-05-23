package com.quantix.finsense.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class MlClientConfig {

    @Bean
    WebClient mlWebClient(@Value("${finsense.ml.base-url:http://localhost:5000}") String baseUrl) {
        return WebClient.builder().baseUrl(baseUrl).build();
    }
}
