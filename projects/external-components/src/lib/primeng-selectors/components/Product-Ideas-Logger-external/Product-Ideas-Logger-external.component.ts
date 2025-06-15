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

@Component({
  selector: 'app-product-ideas-logger',
  template: `
    <!--
      Product-Ideas-Logger Features:
      - Add products with desired features.
      - Mark features as implemented (strike-through).
      - Download/upload data as .txt file.
      - Bootstrap-styled UI.
    -->
    <div class="container my-4">
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <h2 class="card-title mb-3">Product Ideas Logger</h2>
          <form (ngSubmit)="addProduct()" class="row g-2 align-items-center mb-3">
            <div class="col">
              <input type="text"
                     [(ngModel)]="newProductName"
                     name="productName"
                     class="form-control"
                     placeholder="Product Name"
                     required />
            </div>
            <div class="col-auto">
              <button type="submit" class="btn btn-primary">Add Product</button>
            </div>
          </form>
        </div>
      </div>

      <div *ngFor="let product of products; let i = index" class="card mb-3 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">{{ product.name }}</span>
          <button class="btn btn-sm btn-danger" (click)="removeProduct(i)">
            Remove Product
          </button>
        </div>
        <div class="card-body">
          <ul class="list-group mb-3">
            <li *ngFor="let feature of product.features; let j = index"
                class="list-group-item d-flex justify-content-between align-items-center"
                [class.text-decoration-line-through]="feature.implemented"
                [class.text-muted]="feature.implemented"
                style="cursor:pointer;"
                (click)="toggleFeature(i, j)">
              <span>{{ feature.name }}</span>
              <button class="btn btn-sm btn-outline-danger ms-2"
                      (click)="removeFeature(i, j); $event.stopPropagation()">
                ✕
              </button>
            </li>
            <li *ngIf="product.features.length === 0" class="list-group-item text-secondary fst-italic">
              No features added yet.
            </li>
          </ul>
          <form (ngSubmit)="addFeature(i)" class="row g-2 align-items-center">
            <div class="col">
              <input type="text"
                     [(ngModel)]="featureInputs[i]"
                     name="featureInput{{i}}"
                     class="form-control"
                     placeholder="Add Feature"
                     required />
            </div>
            <div class="col-auto">
              <button type="submit" class="btn btn-success">Add Feature</button>
            </div>
          </form>
        </div>
      </div>

      <div class="d-flex gap-3 mt-4">
        <button class="btn btn-outline-primary" (click)="downloadData()">Download Data (.txt)</button>
        <label class="btn btn-outline-secondary mb-0">
          Upload Data (.txt)
          <input type="file" accept=".txt" (change)="uploadData($event)" hidden />
        </label>
      </div>
    </div>
  `,
  styles: [`
    /* Additional minimal custom styling for spacing */
    .card { border-radius: 0.75rem; }
    .list-group-item { user-select: none; }
    .btn-outline-danger { padding: 0 8px; }
  `]
})
export class ProductIdeasLoggerComponent extends CommonExternalComponent {
  newProductName: string = '';
  featureInputs: string[] = [];
  products: ProductIdea[] = [];

  addProduct(): void {
    if (!this.newProductName.trim()) return;
    this.products.push({ name: this.newProductName.trim(), features: [] });
    this.featureInputs.push('');
    this.newProductName = '';
  }

  removeProduct(index: number): void {
    this.products.splice(index, 1);
    this.featureInputs.splice(index, 1);
  }

  addFeature(productIndex: number): void {
    const input: string = this.featureInputs[productIndex];
    if (!input || !input.trim()) return;
    this.products[productIndex].features.push({ name: input.trim(), implemented: false });
    this.featureInputs[productIndex] = '';
  }

  removeFeature(productIndex: number, featureIndex: number): void {
    this.products[productIndex].features.splice(featureIndex, 1);
  }

  toggleFeature(productIndex: number, featureIndex: number): void {
    const feature: ProductFeature = this.products[productIndex].features[featureIndex];
    feature.implemented = !feature.implemented;
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
        }
      } catch (e) {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
}