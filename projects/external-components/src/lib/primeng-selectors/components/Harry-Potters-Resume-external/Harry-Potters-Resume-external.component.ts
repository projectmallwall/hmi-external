import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Harry Potter's detailed resume with sections: Profile, Skills, Education, Experience, Achievements.
  - Bullet points highlighting eligibility for Hogwarts professor.
  - Button to download the resume as PDF (uses browser print-to-PDF).
*/

@Component({
  selector: 'app-harry-potters-resume',
  template: `
    <div class="resume-container" #resumeContent>
      <h1>Harry Potter</h1>
      <p class="subtitle">Auror | Order of the Phoenix | Wizarding World Hero</p>
      <section>
        <h2>Profile</h2>
        <p>
          Courageous and accomplished wizard with extensive experience in Defense Against the Dark Arts, leadership, and mentoring. Proven track record in overcoming adversity, inspiring others, and upholding the values of Hogwarts School of Witchcraft and Wizardry.
        </p>
      </section>
      <section>
        <h2>Key Skills</h2>
        <ul>
          <li>Mastery in Defense Against the Dark Arts</li>
          <li>Exceptional leadership and teamwork abilities</li>
          <li>Expert in Patronus Charm (Stag)</li>
          <li>Proficient in practical magic and spellcasting</li>
          <li>Mentoring and teaching young witches and wizards</li>
        </ul>
      </section>
      <section>
        <h2>Education</h2>
        <ul>
          <li><strong>Hogwarts School of Witchcraft and Wizardry</strong> (1991–1997)
            <ul>
              <li>House: Gryffindor</li>
              <li>Outstanding grades in Defense Against the Dark Arts, Charms, and Transfiguration</li>
              <li>Quidditch Team Captain</li>
            </ul>
          </li>
        </ul>
      </section>
      <section>
        <h2>Professional Experience</h2>
        <ul>
          <li>
            <strong>Auror, Department of Magical Law Enforcement</strong> (1998–Present)
            <ul>
              <li>Defended the wizarding world from dark forces</li>
              <li>Led critical missions against Death Eaters</li>
              <li>Trained new recruits in advanced defensive magic</li>
            </ul>
          </li>
          <li>
            <strong>Dumbledore's Army Founder & Mentor</strong> (1995–1997)
            <ul>
              <li>Organized and taught practical Defense Against the Dark Arts to students</li>
              <li>Developed lesson plans and mentored peers</li>
              <li>Demonstrated ability to inspire and educate under challenging circumstances</li>
            </ul>
          </li>
        </ul>
      </section>
      <section>
        <h2>Achievements</h2>
        <ul>
          <li>Defeated Lord Voldemort and ended the Second Wizarding War</li>
          <li>Recipient of the Order of Merlin, First Class</li>
          <li>Youngest Seeker in a century at Hogwarts</li>
        </ul>
      </section>
      <section>
        <h2>Eligibility for Hogwarts Professor</h2>
        <ul>
          <li>Extensive practical and theoretical knowledge in Defense Against the Dark Arts</li>
          <li>Experience teaching and mentoring students (Dumbledore’s Army)</li>
          <li>Recognized leader and role model in the wizarding community</li>
          <li>Commitment to student safety and development</li>
        </ul>
      </section>
      <button class="pdf-btn" (click)="downloadPDF()">Download as PDF</button>
    </div>
  `,
  styles: [`
    .resume-container {
      max-width: 700px;
      margin: 32px auto;
      padding: 32px;
      background: #f9f9fa;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.10);
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #222;
    }
    h1 {
      margin-bottom: 4px;
      font-size: 2.6rem;
      letter-spacing: 1px;
      color: #3b3b69;
    }
    .subtitle {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 18px;
    }
    section {
      margin-bottom: 22px;
    }
    h2 {
      font-size: 1.25rem;
      margin-bottom: 6px;
      color: #283593;
    }
    ul {
      margin-left: 20px;
      margin-bottom: 0;
    }
    li {
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .pdf-btn {
      display: inline-block;
      margin-top: 14px;
      padding: 10px 24px;
      background: #283593;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .pdf-btn:hover {
      background: #1a237e;
    }
    @media print {
      .pdf-btn { display: none; }
      .resume-container {
        box-shadow: none;
        background: #fff;
        padding: 0;
      }
    }
  `]
})
export class HarryPottersResumeComponent extends CommonExternalComponent {
  // Uses browser print dialog for PDF generation
  downloadPDF(): void {
    window.print();
  }
}