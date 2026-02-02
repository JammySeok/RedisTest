package jammy.com.redistest.domain.queue;

public record QueueStatusDto (
        Long rank,      // 대기 순번 (입장 완료시 0 또는 -1)
        boolean isAllowed, // 입장 허용 여부
        String message // 상태 메시지
) {}