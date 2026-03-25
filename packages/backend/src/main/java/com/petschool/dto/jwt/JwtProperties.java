package com.petschool.dto.jwt;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "pet.jwt")
@Data
public class JwtProperties {

    //jwt相关属性,与配置文件中相匹配
    private String secretKey; //密钥
    private Long ttl; //过期时间，单位毫秒
    private String tokenName; //token前缀
}
