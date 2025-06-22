import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { Vente } from '../../models/vente.model';
import { VenteService } from '../../services/vente.service';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, MatTableModule, HttpClientModule],
  templateUrl: './ventes.component.html',
  styleUrl: './ventes.component.css',
})
export class VentesComponent implements OnInit {
  ventes: Vente[] = [];
  displayedColumns: string[] = [
    'id',
    'date',
    'numeroFacture',
    'numLigne',
    'quantiteFacturee',
    'prix_Vente_TND', // Prix unitaire
    'montantTotal',
    'articleId'
  ];

  constructor(private venteService: VenteService) {}

  ngOnInit() {
    this.loadVentes();
  }
  loadVentes(): void {
    this.venteService.getAll().subscribe({
      next: (data: Vente[]) => {
        this.ventes = data;
      },
      error: (error: any) => {
        console.error('Error loading ventes:', error);
      }
    });
  }

  calculateMontantTotal(vente: Vente): number {
    return vente.quantiteFacturee * vente.prix_Vente_TND;
  }
}
