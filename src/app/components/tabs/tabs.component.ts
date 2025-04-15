import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [
    IonicModule ,
    RouterModule// ✅ Required for <ion-tabs> and other Ionic components
  ],
})
export class TabsComponent {
  constructor(private router: Router) {}

  navigateTo(tab: string) {
    this.router.navigate([`/tabs/${tab}`]);
  }
}
