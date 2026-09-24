package com.petschool.config;

import com.petschool.config.properties.AiProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * HTTP 客户端配置
 * <p>
 * 这里只做超时配置，不读取 api-key、不做启动期校验，
 * 保证 AI 未配置时应用依然可以正常启动。
 */
@Configuration
public class RestTemplateConfig {

    @Bean("aiRestTemplate")
    public RestTemplate aiRestTemplate(AiProperties aiProperties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(aiProperties.getConnectTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(aiProperties.getReadTimeoutMs()));
        return new RestTemplate(factory);
    }
}
