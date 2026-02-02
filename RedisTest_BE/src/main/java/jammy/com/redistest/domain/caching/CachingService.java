package jammy.com.redistest.domain.caching;

import jakarta.transaction.Transactional;
import jammy.com.redistest.common.MemberRepository;
import jammy.com.redistest.common.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class CachingService {

    private final MemberRepository memberRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Transactional
    public Member join(String name, String email) {
        Member member = Member.builder().name(name).email(email).build();
        Member savedMember = memberRepository.save(member);

        String key = "member:" + savedMember.getId();
        redisTemplate.delete(key);

        log.info("H2 DB에 저장 완료: ID={}", savedMember.getId());
        return savedMember;
    }

    public Member getMember(Long id) {
        String key = "member:" + id;
        ValueOperations<String, Object> operations = redisTemplate.opsForValue();

        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            log.info("Redis(Cache)에서 조회 성공! (DB 접근 안 함) : {}", key);
            return (Member) operations.get(key);
        }

        log.info("Redis에 없음... H2 DB로 조회 시도");
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("없는 회원입니다."));

        operations.set(key, member, Duration.ofMinutes(1));
        log.info("H2에서 조회한 데이터를 Redis에 저장 완료 (TTL 1분)");

        return member;
    }
}