import { Component, AfterViewInit } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Interactive cafe menu using Bootstrap accordion (expand/collapse sections)
  - Sections: Smoothies, Pancakes (Breakfast), Roti Bread, Paneer Delicacies, Seafood (Lunch & Dinner)
  - Each dish: name, type/cuisine, price (INR), description
  - Attractive look with Bootstrap cards, badges, responsive grid
  - Accordion expand/collapse enabled via Bootstrap JS initialization in ngAfterViewInit
  - Strict typing for all variables
*/

interface CafeMenuItem {
  name: string;
  type: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-restaurant-menu',
  template: `
    <div class="container my-4">
      <h1 class="text-center text-primary mb-4 display-5 fw-bold">Cafe Menu</h1>
      <div class="accordion" id="cafeMenuAccordion">
        <!-- Smoothies -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingSmoothies">
            <button class="accordion-button fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapseSmoothies"
              aria-expanded="true" aria-controls="collapseSmoothies">
              <span class="me-2"><i class="bi bi-cup-straw"></i></span> Smoothies
              <span class="badge bg-info ms-2">{{ smoothies.length }}</span>
            </button>
          </h2>
          <div id="collapseSmoothies" class="accordion-collapse collapse show"
            aria-labelledby="headingSmoothies" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let smoothie of smoothies">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-success">{{ smoothie.name }}</h5>
                      <span class="badge bg-secondary mb-2">{{ smoothie.type }}</span>
                      <p class="card-text small mb-2">{{ smoothie.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ smoothie.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Pancakes (Breakfast) -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingPancakes">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapsePancakes"
              aria-expanded="false" aria-controls="collapsePancakes">
              <span class="me-2"><i class="bi bi-egg-fried"></i></span> Pancakes (Breakfast)
              <span class="badge bg-warning text-dark ms-2">{{ pancakes.length }}</span>
            </button>
          </h2>
          <div id="collapsePancakes" class="accordion-collapse collapse"
            aria-labelledby="headingPancakes" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let pancake of pancakes">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-warning">{{ pancake.name }}</h5>
                      <span class="badge bg-light text-dark mb-2">{{ pancake.type }}</span>
                      <p class="card-text small mb-2">{{ pancake.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ pancake.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Roti Bread -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingRoti">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapseRoti"
              aria-expanded="false" aria-controls="collapseRoti">
              <span class="me-2"><i class="bi bi-bagel"></i></span> Roti Bread
              <span class="badge bg-success ms-2">{{ rotis.length }}</span>
            </button>
          </h2>
          <div id="collapseRoti" class="accordion-collapse collapse"
            aria-labelledby="headingRoti" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let roti of rotis">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-success">{{ roti.name }}</h5>
                      <span class="badge bg-secondary mb-2">{{ roti.type }}</span>
                      <p class="card-text small mb-2">{{ roti.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ roti.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Paneer Delicacies -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingPaneer">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapsePaneer"
              aria-expanded="false" aria-controls="collapsePaneer">
              <span class="me-2"><i class="bi bi-cup-hot"></i></span> Paneer Delicacies
              <span class="badge bg-danger ms-2">{{ paneers.length }}</span>
            </button>
          </h2>
          <div id="collapsePaneer" class="accordion-collapse collapse"
            aria-labelledby="headingPaneer" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let paneer of paneers">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-danger">{{ paneer.name }}</h5>
                      <span class="badge bg-light text-dark mb-2">{{ paneer.type }}</span>
                      <p class="card-text small mb-2">{{ paneer.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ paneer.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Seafood -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingSeafood">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapseSeafood"
              aria-expanded="false" aria-controls="collapseSeafood">
              <span class="me-2"><i class="bi bi-droplet-half"></i></span> Seafood (Lunch & Dinner)
              <span class="badge bg-primary ms-2">{{ seafoods.length }}</span>
            </button>
          </h2>
          <div id="collapseSeafood" class="accordion-collapse collapse"
            aria-labelledby="headingSeafood" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let seafood of seafoods">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-primary">{{ seafood.name }}</h5>
                      <span class="badge bg-info text-dark mb-2">{{ seafood.type }}</span>
                      <p class="card-text small mb-2">{{ seafood.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ seafood.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-5 text-muted text-center small">* All prices inclusive of taxes</div>
    </div>
  `,
  styles: [`
    .accordion-button { font-size: 1.15rem; }
    .card { transition: box-shadow .2s; }
    .card:hover { box-shadow: 0 8px 24px rgba(44,62,80,.08); }
    .badge { font-size: 0.92em; }
    @media (max-width: 767px) {
      .row.g-3 > [class^='col-'] { flex: 0 0 100%; max-width: 100%; }
    }
  `]
})
export class RestaurantMenuComponent extends CommonExternalComponent implements AfterViewInit {
  smoothies: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Berry Blast',
      type: 'Mixed Berries',
      price: 180,
      description: 'A refreshing blend of strawberries, blueberries, raspberries, yogurt, and honey.'
    },
    {
      name: 'Tropical Sunshine',
      type: 'Mango Pineapple',
      price: 170,
      description: 'Mango, pineapple, banana, coconut water, and a hint of lime.'
    },
    {
      name: 'Green Detox',
      type: 'Spinach Kiwi',
      price: 160,
      description: 'Spinach, kiwi, green apple, cucumber, mint, and lemon juice.'
    },
    {
      name: 'Choco Banana',
      type: 'Banana Cocoa',
      price: 150,
      description: 'Banana, cocoa powder, almond milk, dates, and chia seeds.'
    }
  ];

  pancakes: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Classic Buttermilk Pancakes',
      type: 'Breakfast',
      price: 140,
      description: 'Fluffy pancakes served with maple syrup and whipped butter.'
    },
    {
      name: 'Blueberry Pancakes',
      type: 'Breakfast',
      price: 170,
      description: 'Pancakes loaded with fresh blueberries, topped with berry compote.'
    },
    {
      name: 'Chocolate Chip Pancakes',
      type: 'Breakfast',
      price: 160,
      description: 'Buttermilk pancakes studded with chocolate chips, drizzled with chocolate sauce.'
    },
    {
      name: 'Nutella Banana Pancakes',
      type: 'Breakfast',
      price: 180,
      description: 'Layered with Nutella and banana slices, finished with powdered sugar.'
    }
  ];

  rotis: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Tandoori Roti',
      type: 'Indian Bread',
      price: 35,
      description: 'Whole wheat flatbread baked in a clay oven.'
    },
    {
      name: 'Butter Naan',
      type: 'Indian Bread',
      price: 45,
      description: 'Soft leavened bread brushed with butter.'
    },
    {
      name: 'Laccha Paratha',
      type: 'Indian Bread',
      price: 50,
      description: 'Multi-layered flaky paratha cooked on griddle.'
    },
    {
      name: 'Garlic Naan',
      type: 'Indian Bread',
      price: 55,
      description: 'Naan topped with garlic and coriander.'
    }
  ];

  paneers: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Paneer Butter Masala',
      type: 'North Indian',
      price: 220,
      description: 'Cottage cheese cubes simmered in rich tomato-butter gravy with spices.'
    },
    {
      name: 'Palak Paneer',
      type: 'North Indian',
      price: 210,
      description: 'Paneer cooked in creamy spinach sauce, mildly spiced.'
    },
    {
      name: 'Paneer Tikka Masala',
      type: 'Tandoor Special',
      price: 240,
      description: 'Grilled paneer tikka in spicy onion-tomato curry.'
    },
    {
      name: 'Chili Paneer',
      type: 'Indo-Chinese',
      price: 200,
      description: 'Paneer tossed with bell peppers, onions, and chili sauce.'
    }
  ];

  seafoods: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Fish Curry',
      type: 'Coastal',
      price: 320,
      description: 'Fresh fish cooked in traditional coconut-based curry with regional spices.'
    },
    {
      name: 'Prawn Masala',
      type: 'South Indian',
      price: 350,
      description: 'Juicy prawns sautéed in spicy onion-tomato masala.'
    },
    {
      name: 'Lemon Garlic Grilled Fish',
      type: 'Continental',
      price: 370,
      description: 'Grilled fish fillet marinated with lemon, garlic, and herbs.'
    },
    {
      name: 'Goan Prawn Curry',
      type: 'Goan',
      price: 360,
      description: 'Prawns simmered in tangy Goan coconut curry sauce.'
    }
  ];

  ngAfterViewInit(): void {
    // Ensure Bootstrap JS is available and initialize accordions if needed
    // This allows the expand/collapse to work even if Angular loads after DOMContentLoaded
    if ((window as any).bootstrap) {
      const elements: NodeListOf<Element> = document.querySelectorAll('.accordion');
      elements.forEach((el: Element) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).bootstrap.Collapse.getOrCreateInstance(el);
      });
    }
  }
}