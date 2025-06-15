// product-ideas-logger.component.ts

import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface ProductFeature {
  name: string;
  implemented: boolean;
}

interface ProductIdea {
  name: string;
  features: ProductFeature[];
}

const LOCAL_STORAGE_KEY = 'productIdeasLoggerData';

@Component({
  selector: 'app-product-ideas-logger',
  template: `
    <!--
      Product-Ideas-Logger Features:
      - Add products and their features.
      - Mark features as implemented (strike-through).
      - Download/upload data as .txt file.
      - All data persists in local storage.
      - No Bootstrap; all styles are inline.
    -->
    <div style="max-width:600px;margin:32px auto;padding:0 8px;">
      <div style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001;margin-bottom:24px;">
        <div style="padding:24px;">
          <h2 style="margin:0 0 18px 0;font-size:1.5rem;">Product Ideas Logger</h2>
          <form (ngSubmit)="addProduct()" style="display:flex;gap:8px;align-items:center;margin-bottom:16px;">
            <input type="text"
                   [(ngModel)]="newProductName"
                   name="productName"
                   [style]="inputStyle"
                   placeholder="Product Name"
                   required />
            <button type="submit" [style]="primaryBtnStyle">Add Product</button>
          </form>
        </div>
      </div>

      <div *ngFor="let product of products; let i = index"
           style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001;margin-bottom:18px;">
        <div style="padding:14px 20px 10px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;">
          <span style="font-weight:600;font-size:1.1rem;">{{ product.name }}</span>
          <button (click)="removeProduct(i)"
                  [style]="dangerSmBtnStyle">
            Remove Product
          </button>
        </div>
        <div style="padding:16px 20px 12px 20px;">
          <ul style="list-style:none;padding:0;margin:0 0 15px 0;">
            <li *ngFor="let feature of product.features; let j = index"
                (click)="toggleFeature(i, j)"
                [ngStyle]="{
                  'display': 'flex',
                  'justify-content': 'space-between',
                  'align-items': 'center',
                  'padding': '7px 0',
                  'border-bottom': j < product.features.length-1 ? '1px solid #f0f0f0' : '',
                  'cursor': 'pointer',
                  'color': feature.implemented ? '#999' : '#222',
                  'text-decoration': feature.implemented ? 'line-through' : 'none',
                  'user-select': 'none'
                }">
              <span>{{ feature.name }}</span>
              <button (click)="removeFeature(i, j); $event.stopPropagation();"
                      [style]="outlineDangerBtnStyle">
                ✕
              </button>
            </li>
            <li *ngIf="product.features.length === 0"
                style="color:#bbb;font-style:italic;padding:7px 0;">
              No features added yet.
            </li>
          </ul>
          <form (ngSubmit)="addFeature(i)" style="display:flex;gap:8px;align-items:center;">
            <input type="text"
                   [(ngModel)]="featureInputs[i]"
                   [name]="'featureInput'+i"
                   [style]="inputStyle"
                   placeholder="Add Feature"
                   required />
            <button type="submit" [style]="successBtnStyle">Add Feature</button>
          </form>
        </div>
      </div>

      <div style="display:flex;gap:12px;margin-top:28px;">
        <button (click)="downloadData()" [style]="outlinePrimaryBtnStyle">Download Data (.txt)</button>
        <label [style]="outlineSecondaryBtnStyle+'margin-bottom:0;cursor:pointer;'">
          Upload Data (.txt)
          <input type="file" accept=".txt" (change)="uploadData($event)" style="display:none;" />
        </label>
      </div>
    </div>
  `,
  styles: [`
    /* No global or bootstrap styles used */
  `]
})
export class ProductIdeasLoggerComponent extends CommonExternalComponent {
  newProductName: string = '';
  featureInputs: string[] = [];
  products: ProductIdea[] = [];

  readonly inputStyle = `
    flex:1;
    padding:7px 12px;
    border:1px solid #ccc;
    border-radius:6px;
    font-size:1rem;
    background:#fafbfc;
    outline:none;
    transition:border-color .2s;
  `;
  readonly primaryBtnStyle = `
    background:#2563eb;
    color:#fff;
    border:none;
    border-radius:6px;
    padding:7px 18px;
    font-size:1rem;
    font-weight:500;
    cursor:pointer;
    transition:background .2s;
  `;
  readonly successBtnStyle = `
    background:#059669;
    color:#fff;
    border:none;
    border-radius:6px;
    padding:7px 14px;
    font-size:1rem;
    font-weight:500;
    cursor:pointer;
    transition:background .2s;
  `;
  readonly dangerSmBtnStyle = `
    background:#ef4444;
    color:#fff;
    border:none;
    border-radius:5px;
    padding:4px 11px;
    font-size:0.95rem;
    font-weight:500;
    cursor:pointer;
    transition:background .2s;
  `;
  readonly outlineDangerBtnStyle = `
    background:transparent;
    color:#ef4444;
    border:1px solid #ef4444;
    border-radius:5px;
    padding:2px 9px;
    font-size:1rem;
    cursor:pointer;
    margin-left:10px;
    transition:background .2s,color .2s;
  `;
  readonly outlinePrimaryBtnStyle = `
    background:transparent;
    color:#2563eb;
    border:1.5px solid #2563eb;
    border-radius:6px;
    padding:7px 17px;
    font-size:1rem;
    font-weight:500;
    cursor:pointer;
    transition:background .2s,color .2s;
  `;
  readonly outlineSecondaryBtnStyle = `
    background:transparent;
    color:#374151;
    border:1.5px solid #cbd5e1;
    border-radius:6px;
    padding:7px 17px;
    font-size:1rem;
    font-weight:500;
    display:inline-block;
    transition:background .2s,color .2s;
  `;

  constructor() {
    super();
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.products));
    } catch (e) {
      // Ignore quota errors
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const raw: string | null = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.products = parsed.map((p: any) => ({
            name: typeof p.name === 'string' ? p.name : '',
            features: Array.isArray(p.features)
              ? p.features.map((f: any) => ({
                  name: typeof f.name === 'string' ? f.name : '',
                  implemented: !!f.implemented
                }))
              : []
          }));
          this.featureInputs = this.products.map(() => '');
        }
      }
    } catch {
      this.products = [];
      this.featureInputs = [];
    }
  }

  addProduct(): void {
    if (!this.newProductName.trim()) return;
    this.products.push({ name: this.newProductName.trim(), features: [] });
    this.featureInputs.push('');
    this.newProductName = '';
    this.saveToLocalStorage();
  }

  removeProduct(index: number): void {
    this.products.splice(index, 1);
    this.featureInputs.splice(index, 1);
    this.saveToLocalStorage();
  }

  addFeature(productIndex: number): void {
    const input: string = this.featureInputs[productIndex];
    if (!input || !input.trim()) return;
    this.products[productIndex].features.push({ name: input.trim(), implemented: false });
    this.featureInputs[productIndex] = '';
    this.saveToLocalStorage();
  }

  removeFeature(productIndex: number, featureIndex: number): void {
    this.products[productIndex].features.splice(featureIndex, 1);
    this.saveToLocalStorage();
  }

  toggleFeature(productIndex: number, featureIndex: number): void {
    const feature: ProductFeature = this.products[productIndex].features[featureIndex];
    feature.implemented = !feature.implemented;
    this.saveToLocalStorage();
  }

  downloadData(): void {
    const data: string = JSON.stringify(this.products);
    const blob: Blob = new Blob([data], { type: 'text/plain' });
    const url: string = window.URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = 'product-ideas.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  uploadData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file: File = input.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      try {
        const content: string = reader.result as string;
        const parsed: unknown = JSON.parse(content);
        if (Array.isArray(parsed)) {
          this.products = parsed.map((p: any) => ({
            name: typeof p.name === 'string' ? p.name : '',
            features: Array.isArray(p.features)
              ? p.features.map((f: any) => ({
                  name: typeof f.name === 'string' ? f.name : '',
                  implemented: !!f.implemented
                }))
              : []
          }));
          this.featureInputs = this.products.map(() => '');
          this.saveToLocalStorage();
        }
      } catch (e) {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
}