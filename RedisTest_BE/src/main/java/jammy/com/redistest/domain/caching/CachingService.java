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

    // 1. 데이터 저장 (H2에만 저장하고, Redis 캐시는 지움 - 데이터 불일치 방지)
    @Transactional
    public Member join(String name, String email) {
        Member member = Member.builder().name(name).email(email).build();
        Member savedMember = memberRepository.save(member);

        // 데이터가 변경되었으므로 기존 캐시가 있다면 삭제해야 함 (선택 사항)
        String key = "member:" + savedMember.getId();
        redisTemplate.delete(key);

        log.info("H2 DB에 저장 완료: ID={}", savedMember.getId());
        return savedMember;
    }

    // 2. 데이터 조회 (Look-Aside 패턴 학습)
    public Member getMember(Long id) {
        String key = "member:" + id;
        ValueOperations<String, Object> operations = redisTemplate.opsForValue();

        // [Step 1] Redis(캐시)에 데이터가 있는지 확인
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            log.info("Redis(Cache)에서 조회 성공! (DB 접근 안 함) : {}", key);
            return (Member) operations.get(key); // 캐시된 데이터 반환
        }

        // [Step 2] Redis에 없으면 H2(DB)에서 조회
        log.info("Redis에 없음... H2 DB로 조회 시도");
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("없는 회원입니다."));

        // [Step 3] 조회한 데이터를 Redis에 저장 (다음 조회를 위해)
        // Duration.ofMinutes(1) -> 1분 뒤 자동 삭제 (TTL 설정)
        operations.set(key, member, Duration.ofMinutes(1));
        log.info("H2에서 조회한 데이터를 Redis에 저장 완료 (TTL 1분)");

        return member;
    }
}