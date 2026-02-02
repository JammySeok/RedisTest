package jammy.com.redistest.domain.caching;

import jammy.com.redistest.common.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CachingController {

    private final CachingService cachingService;

    @PostMapping("/join")
    public Member join(@RequestParam String name, @RequestParam String email) {
        return cachingService.join(name, email);
    }

    @GetMapping("/member/{id}")
    public Member getMember(@PathVariable Long id) {
        return cachingService.getMember(id);
    }
}