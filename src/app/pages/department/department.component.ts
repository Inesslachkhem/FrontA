import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepotService } from '../../services/depot.service';
import { Depot } from '../../models/article.model';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department.component.html',
  styleUrl: './department.component.css',
})
export class DepartmentComponent implements OnInit {
  depots: Depot[] = [];
  filteredDepots: Depot[] = [];
  loading = false;
  searchTerm = '';

  // Form data for adding/editing depots
  isModalOpen = false;
  isEditMode = false;
  currentDepot: Partial<Depot> = {};

  // File upload
  selectedFile: File | null = null;
  importMessage: string | null = null;

  // Filtres avancés
  filterCode = '';
  filterLibelle = '';
  filterTypeDepot = '';

  // Import modal
  isImportModalOpen = false;

  constructor(private depotService: DepotService) {}

  ngOnInit() {
    this.loadDepots();
  }

  loadDepots() {
    this.loading = true;
    this.depotService.getAll().subscribe({
      next: (data) => {
        this.depots = data;
        this.filteredDepots = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading depots:', error);
        this.loading = false;
      },
    });
  }
  filterDepots() {
    let filtered = this.depots;
    if (this.searchTerm) {
      filtered = filtered.filter(
        (depot) =>
          depot.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          depot.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          depot.typeDepot?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.filterCode) {
      filtered = filtered.filter((depot) =>
        depot.code.toLowerCase().includes(this.filterCode.toLowerCase())
      );
    }
    if (this.filterLibelle) {
      filtered = filtered.filter((depot) =>
        depot.libelle.toLowerCase().includes(this.filterLibelle.toLowerCase())
      );
    }
    if (this.filterTypeDepot) {
      filtered = filtered.filter((depot) =>
        depot.typeDepot?.trim().toLowerCase() === this.filterTypeDepot.trim().toLowerCase()
      );
    }
    this.filteredDepots = filtered;
  }

  openModal(depot?: Depot) {
    this.isModalOpen = true;
    if (depot) {
      this.isEditMode = true;
      this.currentDepot = { ...depot };
    } else {
      this.isEditMode = false;
      this.currentDepot = {};
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentDepot = {};
  }

  saveDepot() {
    if (this.isEditMode && this.currentDepot.id) {
      this.depotService
        .update(this.currentDepot.id, this.currentDepot as Depot)
        .subscribe({
          next: () => {
            this.loadDepots();
            this.closeModal();
          },
          error: (error) => console.error('Error updating depot:', error),
        });
    } else {
      this.depotService.create(this.currentDepot as Depot).subscribe({
        next: () => {
          this.loadDepots();
          this.closeModal();
        },
        error: (error) => console.error('Error creating depot:', error),
      });
    }
  }

  deleteDepot(id: number) {
    if (confirm('Are you sure you want to delete this depot?')) {
      this.depotService.delete(id).subscribe({
        next: () => this.loadDepots(),
        error: (error) => console.error('Error deleting depot:', error),
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  openImportModal() {
    this.isImportModalOpen = true;
    this.selectedFile = null;
    this.importMessage = null;
  }
  closeImportModal() {
    this.isImportModalOpen = false;
    this.selectedFile = null;
    this.importMessage = null;
  }

  importDepots() {
    if (this.selectedFile) {
      this.depotService.importDepots(this.selectedFile).subscribe({
        next: (response) => {
          this.importMessage = response?.message || 'Importation réussie !';
          this.loadDepots();
          this.selectedFile = null;
          this.closeImportModal();
        },
        error: (error) => {
          this.importMessage = error?.error?.error || 'Erreur lors de l\'importation.';
        },
      });
    }
  }
}
