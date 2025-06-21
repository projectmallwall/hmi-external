import { Component, AfterViewInit } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Interactive cafe menu with Bootstrap accordion (expand/collapse sections)
  - Menu categories: Coffee, Tea, Pastries, Sandwiches, Salads
  - Each item displays: name, type/flavor, price (INR), description
  - Responsive layout using Bootstrap grid and cards
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
        <!-- Coffee -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingCoffee">
            <button class="accordion-button fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapseCoffee"
              aria-expanded="true" aria-controls="collapseCoffee">
              <span class="me-2"><i class="bi bi-cup-hot"></i></span> Coffee
              <span class="badge bg-brown ms-2">{{ coffees.length }}</span>
            </button>
          </h2>
          <div id="collapseCoffee" class="accordion-collapse collapse show"
            aria-labelledby="headingCoffee" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let coffee of coffees">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-brown">{{ coffee.name }}</h5>
                      <span class="badge bg-secondary mb-2">{{ coffee.type }}</span>
                      <p class="card-text small mb-2">{{ coffee.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ coffee.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Tea -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingTea">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapseTea"
              aria-expanded="false" aria-controls="collapseTea">
              <span class="me-2"><i class="bi bi-cup-straw"></i></span> Tea
              <span class="badge bg-success ms-2">{{ teas.length }}</span>
            </button>
          </h2>
          <div id="collapseTea" class="accordion-collapse collapse"
            aria-labelledby="headingTea" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let tea of teas">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-success">{{ tea.name }}</h5>
                      <span class="badge bg-light text-dark mb-2">{{ tea.type }}</span>
                      <p class="card-text small mb-2">{{ tea.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ tea.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Pastries -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingPastries">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapsePastries"
              aria-expanded="false" aria-controls="collapsePastries">
              <span class="me-2"><i class="bi bi-cake"></i></span> Pastries
              <span class="badge bg-pink ms-2">{{ pastries.length }}</span>
            </button>
          </h2>
          <div id="collapsePastries" class="accordion-collapse collapse"
            aria-labelledby="headingPastries" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let pastry of pastries">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-pink">{{ pastry.name }}</h5>
                      <span class="badge bg-secondary mb-2">{{ pastry.type }}</span>
                      <p class="card-text small mb-2">{{ pastry.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ pastry.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Sandwiches -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingSandwiches">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapseSandwiches"
              aria-expanded="false" aria-controls="collapseSandwiches">
              <span class="me-2"><i class="bi bi-egg-fried"></i></span> Sandwiches
              <span class="badge bg-warning text-dark ms-2">{{ sandwiches.length }}</span>
            </button>
          </h2>
          <div id="collapseSandwiches" class="accordion-collapse collapse"
            aria-labelledby="headingSandwiches" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let sandwich of sandwiches">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-warning">{{ sandwich.name }}</h5>
                      <span class="badge bg-light text-dark mb-2">{{ sandwich.type }}</span>
                      <p class="card-text small mb-2">{{ sandwich.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ sandwich.price.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Salads -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingSalads">
            <button class="accordion-button collapsed fw-semibold" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapseSalads"
              aria-expanded="false" aria-controls="collapseSalads">
              <span class="me-2"><i class="bi bi-droplet-half"></i></span> Salads
              <span class="badge bg-info ms-2">{{ salads.length }}</span>
            </button>
          </h2>
          <div id="collapseSalads" class="accordion-collapse collapse"
            aria-labelledby="headingSalads" data-bs-parent="#cafeMenuAccordion">
            <div class="accordion-body">
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let salad of salads">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-1 fw-bold text-info">{{ salad.name }}</h5>
                      <span class="badge bg-secondary mb-2">{{ salad.type }}</span>
                      <p class="card-text small mb-2">{{ salad.description }}</p>
                      <span class="fw-bold text-primary fs-5">₹{{ salad.price.toFixed(0) }}</span>
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
    .bg-brown { background-color: #795548 !important; color: #fff; }
    .text-brown { color: #795548 !important; }
    .bg-pink { background-color: #e75480 !important; color: #fff; }
    .text-pink { color: #e75480 !important; }
    @media (max-width: 767px) {
      .row.g-3 > [class^='col-'] { flex: 0 0 100%; max-width: 100%; }
    }
  `]
})
export class RestaurantMenuComponent extends CommonExternalComponent implements AfterViewInit {
  coffees: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Espresso',
      type: 'Classic',
      price: 110,
      description: 'Rich, concentrated shot of premium coffee beans.'
    },
    {
      name: 'Cappuccino',
      type: 'Milk Coffee',
      price: 140,
      description: 'Espresso with steamed milk and a thick layer of froth.'
    },
    {
      name: 'Cafe Latte',
      type: 'Milk Coffee',
      price: 150,
      description: 'Smooth blend of espresso and creamy steamed milk.'
    },
    {
      name: 'Mocha',
      type: 'Chocolate',
      price: 160,
      description: 'Espresso, chocolate, and steamed milk topped with whipped cream.'
    }
  ];

  teas: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Masala Chai',
      type: 'Spiced Tea',
      price: 90,
      description: 'Traditional Indian tea brewed with spices and milk.'
    },
    {
      name: 'Green Tea',
      type: 'Herbal',
      price: 100,
      description: 'Refreshing antioxidant-rich green tea.'
    },
    {
      name: 'Earl Grey',
      type: 'Black Tea',
      price: 120,
      description: 'Aromatic black tea infused with bergamot orange.'
    },
    {
      name: 'Chamomile',
      type: 'Herbal',
      price: 130,
      description: 'Calming herbal infusion made from chamomile flowers.'
    }
  ];

  pastries: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Chocolate Croissant',
      type: 'French',
      price: 90,
      description: 'Flaky croissant filled with rich chocolate.'
    },
    {
      name: 'Blueberry Muffin',
      type: 'American',
      price: 80,
      description: 'Soft muffin loaded with juicy blueberries.'
    },
    {
      name: 'Red Velvet Cake',
      type: 'Layered',
      price: 120,
      description: 'Moist red velvet sponge layered with cream cheese frosting.'
    },
    {
      name: 'Lemon Tart',
      type: 'Tart',
      price: 110,
      description: 'Tangy lemon curd in a crisp buttery shell.'
    }
  ];

  sandwiches: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Grilled Veggie Sandwich',
      type: 'Vegetarian',
      price: 130,
      description: 'Grilled bell peppers, zucchini, and cheese on multigrain bread.'
    },
    {
      name: 'Chicken Club Sandwich',
      type: 'Non-Veg',
      price: 160,
      description: 'Triple-layered sandwich with chicken, bacon, lettuce & tomato.'
    },
    {
      name: 'Paneer Tikka Sandwich',
      type: 'Indian',
      price: 140,
      description: 'Spicy paneer tikka filling with onions and mint chutney.'
    },
    {
      name: 'Egg Mayo Sandwich',
      type: 'Classic',
      price: 120,
      description: 'Creamy egg mayo with lettuce and pepper.'
    }
  ];

  salads: ReadonlyArray<CafeMenuItem> = [
    {
      name: 'Greek Salad',
      type: 'Mediterranean',
      price: 130,
      description: 'Cucumber, tomatoes, feta, olives, onion, olive oil dressing.'
    },
    {
      name: 'Caesar Salad',
      type: 'Classic',
      price: 140,
      description: 'Romaine lettuce, parmesan, croutons, Caesar dressing.'
    },
    {
      name: 'Quinoa Chickpea Salad',
      type: 'Healthy',
      price: 150,
      description: 'Protein-packed quinoa, chickpeas, veggies, lemon vinaigrette.'
    },
    {
      name: 'Fruit & Nut Salad',
      type: 'Seasonal',
      price: 120,
      description: 'Fresh fruits, mixed nuts, honey-lime drizzle.'
    }
  ];

  ngAfterViewInit(): void {
    // Ensure Bootstrap JS is available and initialize accordions if needed
    if ((window as any).bootstrap) {
      const elements: NodeListOf<Element> = document.querySelectorAll('.accordion');
      elements.forEach((el: Element) => {
        (window as any).bootstrap.Collapse.getOrCreateInstance(el);
      });
    }
  }
}