import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Menu sections: Soups, Starters, Main Course, Dessert
  - Each dish has name, cuisine (Chinese/Thai), price in INR, and description
  - Responsive layout with clear sectioning
  - Description shown under each dish
*/

@Component({
  selector: 'app-restaurant-menu',
  template: `
    <div class="menu-container">
      <h1 class="restaurant-title">Restaurant Menu</h1>
      <section class="menu-section">
        <h2>Soups</h2>
        <ul>
          <li *ngFor="let soup of soups">
            <div class="dish-header">
              <span class="dish">{{ soup.name }}</span>
              <span class="cuisine">({{ soup.cuisine }})</span>
              <span class="price">₹{{ soup.price.toFixed(0) }}</span>
            </div>
            <div class="desc">{{ soup.description }}</div>
          </li>
        </ul>
      </section>
      <section class="menu-section">
        <h2>Starters</h2>
        <ul>
          <li *ngFor="let starter of starters">
            <div class="dish-header">
              <span class="dish">{{ starter.name }}</span>
              <span class="cuisine">({{ starter.cuisine }})</span>
              <span class="price">₹{{ starter.price.toFixed(0) }}</span>
            </div>
            <div class="desc">{{ starter.description }}</div>
          </li>
        </ul>
      </section>
      <section class="menu-section">
        <h2>Main Course</h2>
        <ul>
          <li *ngFor="let main of mains">
            <div class="dish-header">
              <span class="dish">{{ main.name }}</span>
              <span class="cuisine">({{ main.cuisine }})</span>
              <span class="price">₹{{ main.price.toFixed(0) }}</span>
            </div>
            <div class="desc">{{ main.description }}</div>
          </li>
        </ul>
      </section>
      <section class="menu-section">
        <h2>Dessert</h2>
        <ul>
          <li *ngFor="let dessert of desserts">
            <div class="dish-header">
              <span class="dish">{{ dessert.name }}</span>
              <span class="cuisine">({{ dessert.cuisine }})</span>
              <span class="price">₹{{ dessert.price.toFixed(0) }}</span>
            </div>
            <div class="desc">{{ dessert.description }}</div>
          </li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .menu-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: #fffdfa;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.07);
      font-family: 'Segoe UI', sans-serif;
    }
    .restaurant-title {
      text-align: center;
      color: #b23c17;
      letter-spacing: 2px;
      margin-bottom: 2rem;
    }
    .menu-section {
      margin-bottom: 2rem;
    }
    .menu-section h2 {
      color: #267373;
      border-bottom: 2px solid #e3e3e3;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    ul {
      list-style: none;
      padding-left: 0;
    }
    li {
      margin-bottom: 1.25rem;
    }
    .dish-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.05rem;
    }
    .dish {
      font-weight: 500;
      flex: 2;
    }
    .cuisine {
      color: #888;
      font-size: 0.95em;
      flex: 1;
      text-align: right;
      margin-right: 1rem;
    }
    .price {
      color: #b23c17;
      font-weight: bold;
      min-width: 60px;
      text-align: right;
    }
    .desc {
      font-size: 0.98em;
      color: #555;
      margin-top: 0.25rem;
      margin-left: 0.15rem;
      line-height: 1.5;
    }
    @media (max-width: 500px) {
      .menu-container {
        padding: 1rem;
      }
      .dish-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .cuisine, .price {
        text-align: left;
        margin-right: 0;
      }
    }
  `]
})
export class RestaurantMenuComponent extends CommonExternalComponent {
  soups: ReadonlyArray<{ name: string; cuisine: 'Chinese' | 'Thai'; price: number; description: string }> = [
    {
      name: 'Hot & Sour Soup',
      cuisine: 'Chinese',
      price: 180,
      description: 'A spicy and tangy soup made with fresh vegetables, mushrooms, tofu, and a blend of Chinese spices.'
    },
    {
      name: 'Tom Yum Soup',
      cuisine: 'Thai',
      price: 210,
      description: 'Classic Thai soup with lemongrass, kaffir lime leaves, galangal, mushrooms, and chili, served with your choice of vegetables or chicken.'
    },
    {
      name: 'Sweet Corn Soup',
      cuisine: 'Chinese',
      price: 170,
      description: 'Creamy corn soup cooked with sweet corn kernels, carrots, and spring onions in a light broth.'
    },
    {
      name: 'Tom Kha Gai',
      cuisine: 'Thai',
      price: 230,
      description: 'Traditional coconut milk-based soup with chicken, mushrooms, lemongrass, galangal, and fresh herbs.'
    }
  ];

  starters: ReadonlyArray<{ name: string; cuisine: 'Chinese' | 'Thai'; price: number; description: string }> = [
    {
      name: 'Spring Rolls',
      cuisine: 'Chinese',
      price: 240,
      description: 'Crispy rolls stuffed with mixed vegetables, served with sweet chili dipping sauce.'
    },
    {
      name: 'Chicken Satay',
      cuisine: 'Thai',
      price: 290,
      description: 'Grilled marinated chicken skewers, served with creamy peanut sauce and cucumber relish.'
    },
    {
      name: 'Crispy Wontons',
      cuisine: 'Chinese',
      price: 220,
      description: 'Golden-fried wontons filled with spiced chicken or vegetables, accompanied by tangy sauce.'
    },
    {
      name: 'Thai Fish Cakes',
      cuisine: 'Thai',
      price: 310,
      description: 'Minced fish blended with Thai herbs and spices, deep-fried and served with sweet chili sauce.'
    }
  ];

  mains: ReadonlyArray<{ name: string; cuisine: 'Chinese' | 'Thai'; price: number; description: string }> = [
    {
      name: 'Kung Pao Chicken',
      cuisine: 'Chinese',
      price: 430,
      description: 'Stir-fried chicken tossed with bell peppers, peanuts, and dried chilies in a savory sauce.'
    },
    {
      name: 'Pad Thai Noodles',
      cuisine: 'Thai',
      price: 390,
      description: 'Stir-fried rice noodles with tofu, egg, bean sprouts, peanuts, and your choice of vegetables or chicken.'
    },
    {
      name: 'Schezwan Fried Rice',
      cuisine: 'Chinese',
      price: 340,
      description: 'Spicy fried rice with vegetables, Schezwan sauce, and optional chicken or paneer.'
    },
    {
      name: 'Green Curry with Jasmine Rice',
      cuisine: 'Thai',
      price: 470,
      description: 'Fragrant green curry with coconut milk, seasonal vegetables, basil, and steamed jasmine rice.'
    }
  ];

  desserts: ReadonlyArray<{ name: string; cuisine: 'Chinese' | 'Thai'; price: number; description: string }> = [
    {
      name: 'Darsaan with Ice Cream',
      cuisine: 'Chinese',
      price: 190,
      description: 'Crispy honey-glazed flat noodles topped with vanilla ice cream and sesame seeds.'
    },
    {
      name: 'Mango Sticky Rice',
      cuisine: 'Thai',
      price: 210,
      description: 'Traditional Thai dessert of sweet sticky rice served with ripe mango slices and coconut cream.'
    }
  ];
}