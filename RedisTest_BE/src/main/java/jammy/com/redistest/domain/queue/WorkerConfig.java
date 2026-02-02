package jammy.com.redistest.domain.queue;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class WorkerConfig {

    private final QueueService queueService;

    // [시나리오 A Worker] 1초마다 무조건 5명 들여보냄 (기존 유저가 있든 말든)
    @Scheduled(fixedDelay = 1000)
    public void workerScenarioA() {
        queueService.allowUserA(5);
    }

    // [시나리오 B Worker] 최대 3명 유지하고, 1분이  없애기
    @Scheduled(fixedDelay = 1000)
    public void workerScenarioB() {
        queueService.allowUserB(3);
    }
}