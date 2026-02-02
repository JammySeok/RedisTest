package jammy.com.redistest.domain.queue;

import jammy.com.redistest.common.QueueStatusDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class QueueController {

    private final QueueService queueService;

    // 기본 대기열 등록
    @PostMapping("/simple/add")
    public String addSimple(@RequestParam String name) {
        queueService.addSimpleTask(name);
        return "기존 대기열 등록 완료";
    }


    /**
     * [시나리오 A]
     * - 시간 기반 입장 (무조건 1초에 5명)
     * 유저가 몰린다 -> 대기열 서버에 들어간다 -> ZSet에 데이터가 들어간다 -> 1초마다 5명씩 처리된다
     *   -> 내 차례가 되면 입장할 수 있다. (서비스 입장하기!)
     */

    // [시나리오 A] 대기열 진입
    @PostMapping("/scenario-a/enter")
    public String enterA(@RequestParam String name) {
        queueService.registerQueueA(name);
        return "A 대기열 진입 완료";
    }

    // [시나리오 A] 대기 상태 확인
    @GetMapping("/scenario-a/status")
    public QueueStatusDto statusA(@RequestParam String name) {
        return queueService.getStatusA(name);
    }


    /**
     * [시나리오 B]
     * - 수용량 기반 입장 (빈자리가 나야 입장)
     * 유저가 몰린다 -> 대기열 서버에 들어간다 -> ZSet에 데이터가 들어간다 -> 3명씩 입장한다
     * -> 앞에 유저가 해당 작업을 종료할 때까지 대기 -> 내 차례가 되면 입장할 수 있다. (서비스 입장하기!)
     */

    // [시나리오 B] 대기열 진입
    @PostMapping("/scenario-b/enter")
    public String enterB(@RequestParam String name) {
        queueService.registerQueueB(name);
        return "B 대기열 진입 완료";
    }

    // [시나리오 B] 대기 상태 확인
    @GetMapping("/scenario-b/status")
    public QueueStatusDto statusB(@RequestParam String name) {
        return queueService.getStatusB(name);
    }

    // [시나리오 B] 퇴장 (작업 완료)
    @PostMapping("/scenario-b/exit")
    public String exitB(@RequestParam String name) {
        queueService.exitQueueB(name);
        return "B 퇴장 완료 (빈자리 생성됨)";
    }
}