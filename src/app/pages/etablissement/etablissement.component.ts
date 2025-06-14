import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtablissementService } from '../../services/etablissement.service';
import { Etablissement } from '../../models/article.model';

@Component({
  selector: 'app-etablissement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etablissement.component.html',
  styleUrl: './etablissement.component.css',
})
export class EtablissementComponent implements OnInit {
  etablissements: Etablissement[] = [];
  filteredEtablissements: Etablissement[] = [];
  loading = false;
  searchTerm = '';

  // Form data for adding/editing etablissements
  isModalOpen = false;
  isEditMode = false;
  currentEtablissement: Partial<Etablissement> = {};

  // File upload
  selectedFile: File | null = null;

  constructor(private etablissementService: EtablissementService) {}

  ngOnInit() {
    this.loadEtablissements();
  }

  loadEtablissements() {
    this.loading = true;
    this.etablissementService.getAll().subscribe({
      next: (data) => {
        this.etablissements = data;
        this.filteredEtablissements = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading etablissements:', error);
        this.loading = false;
      },
    });
  }
  filterEtablissements() {
    if (!this.searchTerm) {
      this.filteredEtablissements = this.etablissements;
    } else {
      this.filteredEtablissements = this.etablissements.filter(
        (etab) =>
          etab.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          etab.adresse?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          etab.code?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  openModal(etablissement?: Etablissement) {
    this.isModalOpen = true;
    if (etablissement) {
      this.isEditMode = true;
      this.currentEtablissement = { ...etablissement };
    } else {
      this.isEditMode = false;
      this.currentEtablissement = {};
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentEtablissement = {};
  }

  saveEtablissement() {
    if (this.isEditMode && this.currentEtablissement.id) {
      this.etablissementService
        .update(
          this.currentEtablissement.id,
          this.currentEtablissement as Etablissement
        )
        .subscribe({
          next: () => {
            this.loadEtablissements();
            this.closeModal();
          },
          error: (error) =>
            console.error('Error updating etablissement:', error),
        });
    } else {
      this.etablissementService
        .create(this.currentEtablissement as Etablissement)
        .subscribe({
          next: () => {
            this.loadEtablissements();
            this.closeModal();
          },
          error: (error) =>
            console.error('Error creating etablissement:', error),
        });
    }
  }

  deleteEtablissement(id: number) {
    if (confirm('Are you sure you want to delete this etablissement?')) {
      this.etablissementService.delete(id).subscribe({
        next: () => this.loadEtablissements(),
        error: (error) => console.error('Error deleting etablissement:', error),
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  importEtablissements() {
    if (this.selectedFile) {
      this.etablissementService
        .importEtablissements(this.selectedFile)
        .subscribe({
          next: (response) => {
            console.log('Import successful:', response);
            this.loadEtablissements();
            this.selectedFile = null;
          },
          error: (error) =>
            console.error('Error importing etablissements:', error),
        });
    }
  }
}
