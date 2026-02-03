package jammy.com.redistest.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private int port;

    // Redis 연결 팩토리 생성 (client = Lettuce)
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    // 데이터 직렬화
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());  // 팩토리 연결

        // Key : Value 데이터 직렬화
        redisTemplate.setKeySerializer(new StringRedisSerializer());  // 일반 문자열로 저장
        redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());  // JSON 문자열로 변환해서 저장

        // Hash Operation 사용 시 Key:Value 직렬화
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());  // 일반 문자열로 저장
        redisTemplate.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());  // JSON 문자열로 변환해서 저장

        return redisTemplate;
    }
}
