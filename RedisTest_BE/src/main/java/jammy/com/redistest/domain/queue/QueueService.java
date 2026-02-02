package jammy.com.redistest.domain.queue;

import jammy.com.redistest.common.QueueStatusDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueueService {

    private final RedisTemplate<String, Object> redisTemplate;

    // === 바로 처리 ===
    private static final String SIMPLE_QUEUE_KEY = "simple_queue";

    // === [시나리오 A] 시간 기반 입장 (무조건 1초에 5명) ===
    private static final String WAIT_KEY_A = "waiting_queue_a";
    private static final String ACTIVE_KEY_A = "active_queue_a";

    // === [시나리오 B] 수용량 기반 입장 (빈자리가 나야 입장) ===
    private static final String WAIT_KEY_B = "waiting_queue_b";
    private static final String ACTIVE_KEY_B = "active_queue_b";


    // =====================================================================
    // 기본 로직: 넣고 -> 스케줄러가 바로 꺼내서 작업 -> 삭제
    // =====================================================================

    // 1. 단순 작업 등록
    public void addSimpleTask(String username) {
        long timeScore = System.currentTimeMillis();
        redisTemplate.opsForZSet().add(SIMPLE_QUEUE_KEY, username, timeScore);
        log.info("[기존] 작업열 등록: {}", username);
    }

    // 2. 단순 작업 처리 (스케줄러가 호출)
    public void processSimpleTask() {
        ZSetOperations.TypedTuple<Object> tuple = redisTemplate.opsForZSet().popMin(SIMPLE_QUEUE_KEY);
        if (tuple == null) return; // 대기열 비어있음

        String username = (String) tuple.getValue();
        log.info("[기존] 작업 처리 시작: {} (5초 소요)", username);

        try {
            Thread.sleep(5000); // 작업 시늉
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        log.info("[기존] 작업 완료: {}", username);
    }


    // =====================================================================
    // [시나리오 A] 메서드 모음: Rate Limiter (단순 통과)
    // =====================================================================

    public void registerQueueA(String username) {
        long timeScore = System.currentTimeMillis();
        redisTemplate.opsForZSet().add(WAIT_KEY_A, username, timeScore);
    }

    public QueueStatusDto getStatusA(String username) {
        return getQueueStatus(username, WAIT_KEY_A, ACTIVE_KEY_A);
    }

    // 스케줄러 A가 호출: 묻지도 따지지도 않고 count만큼 이동
    public void allowUserA(long count) {
        Set<Object> allowedUsers = redisTemplate.opsForZSet().range(WAIT_KEY_A, 0, count - 1);
        if (allowedUsers == null || allowedUsers.isEmpty()) return;

        for (Object user : allowedUsers) {
            String username = (String) user;
            redisTemplate.opsForSet().add(ACTIVE_KEY_A, username);
            redisTemplate.opsForZSet().remove(WAIT_KEY_A, username);
            log.info("[Scenario A] 🚀 1초 경과! 사용자 입장시킴: {}", username);
        }
    }

    // =====================================================================
    // [시나리오 B] 메서드 모음: Capacity Limit (엄격한 정원제)
    // =====================================================================

    public void registerQueueB(String username) {
        long timeScore = System.currentTimeMillis();
        redisTemplate.opsForZSet().add(WAIT_KEY_B, username, timeScore);
    }

    public QueueStatusDto getStatusB(String username) {
        return getQueueStatus(username, WAIT_KEY_B, ACTIVE_KEY_B);
    }

    // 스케줄러 C가 호출: "빈자리"가 있을 때만 이동
    public void allowUserB(long maxCapacity) {
        // 1. 현재 입장 인원 확인
        Long currentActive = redisTemplate.opsForSet().size(ACTIVE_KEY_B);
        if (currentActive == null) currentActive = 0L;

        // 2. 빈자리 계산
        long availableSlots = maxCapacity - currentActive;

        if (availableSlots <= 0) {
            // 자리가 없으면 아무도 입장 못함!
            return;
        }

        // 3. 빈자리만큼만 이동
        Set<Object> allowedUsers = redisTemplate.opsForZSet().range(WAIT_KEY_B, 0, availableSlots - 1);
        if (allowedUsers == null || allowedUsers.isEmpty()) return;

        for (Object user : allowedUsers) {
            String username = (String) user;
            redisTemplate.opsForSet().add(ACTIVE_KEY_B, username);
            redisTemplate.opsForZSet().remove(WAIT_KEY_B, username);
            log.info("[Scenario B] ✅ 빈자리 발생! 사용자 입장: {} (현재 {}/{})", username, currentActive + 1, maxCapacity);
        }
    }

    // 사용자 퇴장 (빈자리 만들기)
    public void exitQueueB(String username) {
        redisTemplate.opsForSet().remove(ACTIVE_KEY_B, username);
        redisTemplate.opsForZSet().remove(WAIT_KEY_B, username); // 혹시 대기열에 있다면 제거
        log.info("[Scenario B] 🚪 사용자 퇴장: {}. (빈자리가 생겼습니다)", username);
    }


    // =====================================================================
    // 공통 헬퍼 메서드
    // =====================================================================

    private QueueStatusDto getQueueStatus(String username, String waitKey, String activeKey) {
        Boolean isAllowed = redisTemplate.opsForSet().isMember(activeKey, username);
        if (Boolean.TRUE.equals(isAllowed)) {
            return new QueueStatusDto(0L, true, "입장 완료! 서비스를 이용하세요.");
        }
        Long rank = redisTemplate.opsForZSet().rank(waitKey, username);
        if (rank != null) {
            return new QueueStatusDto(rank + 1, false, "대기 중입니다.");
        }
        return new QueueStatusDto(-1L, false, "대기열에 없습니다.");
    }
}
