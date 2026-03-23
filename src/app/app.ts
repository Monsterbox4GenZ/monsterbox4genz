import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ThemeService } from './core/services/theme.service';

// Import thư viện Particles mới nhất
import { NgxParticlesModule } from '@tsparticles/angular';
import { loadAll } from '@tsparticles/all';
import {
  MoveDirection,
  OutMode,
  type ISourceOptions,
  type Engine
} from '@tsparticles/engine';

@Component({
  selector: 'app-root',
  standalone: true,
  // Đã đổi thành NgxParticlesModule để sửa lỗi TS2724
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgxParticlesModule],
  template: `
<!--    <ngx-particles-->
<!--      [id]="particlesId"-->
<!--      [options]="particlesOptions"-->
<!--      [particlesInit]="particlesInit"-->
<!--    ></ngx-particles>-->

    <div class="relative z-10 min-h-screen flex flex-col transition-colors duration-500">
      <app-header />

      <main class="flex-grow">
        <router-outlet />
      </main>

      <app-footer />
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Định vị canvas particles luôn nằm dưới cùng và cố định */
    #tsparticles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      /* Màu nền tối sâu để làm nổi bật màu tím */
      background-color: #03040c;
    }

    /* Đảm bảo nội dung chính có thể nhìn xuyên thấu nền nếu cần */
    .relative {
      background: transparent;
    }
  `]
})
export class App {
  themeService = inject(ThemeService);
  particlesId = 'tsparticles';

  // Cấu hình chi tiết cho hiệu ứng mạng lưới màu tím (Plexus)
  // particlesOptions: ISourceOptions = {
  //   fpsLimit: 120,
  //   interactivity: {
  //     events: {
  //       onHover: {
  //         enable: true,
  //         mode: 'grab', // Nối dây khi di chuột tới gần
  //       },
  //     },
  //     modes: {
  //       grab: {
  //         distance: 200,
  //         links: {
  //           opacity: 0.5
  //         }
  //       }
  //     }
  //   },
  //   particles: {
  //     color: {
  //       value: '#8b5cf6' // Màu tím Violet hiện đại
  //     },
  //     links: {
  //       color: '#8b5cf6',
  //       distance: 150,
  //       enable: true,
  //       opacity: 0.3,
  //       width: 1
  //     },
  //     move: {
  //       direction: MoveDirection.none,
  //       enable: true,
  //       outModes: {
  //         default: OutMode.out
  //       },
  //       random: false,
  //       speed: 1, // Tốc độ di chuyển chậm, tinh tế
  //       straight: false
  //     },
  //     number: {
  //       density: {
  //         enable: true,
  //       },
  //       value: 100 // Số lượng hạt (tăng lên nếu muốn mạng lưới dày hơn)
  //     },
  //     opacity: {
  //       value: { min: 0.2, max: 0.6 }
  //     },
  //     shape: {
  //       type: 'square' // Hình vuông nhỏ giống ảnh mẫu bạn gửi
  //     },
  //     size: {
  //       value: { min: 1, max: 3 }
  //     }
  //   },
  //   detectRetina: true
  // };

  constructor() {
    // Khởi tạo theme (Dark/Light) khi ứng dụng chạy
    this.themeService.initTheme();
  }

  // Hàm khởi tạo engine cho Particles
  particlesInit = async (engine: Engine): Promise<void> => {
    // loadAll sẽ tải tất cả các plugin cần thiết (màu sắc, hình dạng, di chuyển)
    await loadAll(engine);
  };
}
