import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { DepotService } from '../../services/depot.service';
import { ModalService } from '../../services/modal.service';
import { Depot } from '../../models/article.model';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule],
  templateUrl: './department.component.html',
  styleUrl: './department.component.css',
})
export class DepartmentComponent implements OnInit {
  @ViewChild('depotModalTemplate', { static: true })
  depotModalTemplate!: TemplateRef<any>;

  depots: Depot[] = [];
  filteredDepots: Depot[] = [];
  loading = false;
  searchTerm = '';

  // Form data for adding/editing depots
  isModalOpen = false;
  isEditMode = false;
  currentDepot: Partial<Depot> = {};

  // Modal animation states
  isClosingModal = false;

  // File upload
  selectedFile: File | null = null;

  // Messages
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private depotService: DepotService,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService
  ) {}

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
    if (!this.searchTerm) {
      this.filteredDepots = this.depots;
    } else {
      this.filteredDepots = this.depots.filter(
        (depot) =>
          depot.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          depot.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          depot.typeDepot?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  openModal(depot?: Depot) {
    if (depot) {
      this.isEditMode = true;
      this.currentDepot = { ...depot };
    } else {
      this.isEditMode = false;
      this.currentDepot = {};
    }
    this.modalService.openModal(this.depotModalTemplate, this.viewContainerRef);
  }

  closeModal() {
    this.isClosingModal = true;
    this.modalService.closeModal();

    setTimeout(() => {
      this.isModalOpen = false;
      this.isEditMode = false;
      this.currentDepot = {};
      this.isClosingModal = false;
    }, 300);
  }

  saveDepot() {
    if (this.isEditMode && this.currentDepot.id) {
      this.depotService
        .update(this.currentDepot.id, this.currentDepot as Depot)
        .subscribe({
          next: () => {
            this.loadDepots();
            this.closeModal();
            this.showMessage('Depot updated successfully', 'success');
          },
          error: (error) => {
            console.error('Error updating depot:', error);
            this.showMessage('Error updating depot', 'error');
          },
        });
    } else {
      this.depotService.create(this.currentDepot as Depot).subscribe({
        next: () => {
          this.loadDepots();
          this.closeModal();
          this.showMessage('Depot created successfully', 'success');
        },
        error: (error) => {
          console.error('Error creating depot:', error);
          this.showMessage('Error creating depot', 'error');
        },
      });
    }
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  deleteDepot(id: number) {
    const depot = this.depots.find((d) => d.id === id);
    const depotName = depot ? depot.libelle : 'ce dépôt';

    this.confirmationService.confirmDelete(depotName).subscribe((confirmed) => {
      if (confirmed) {
        this.depotService.delete(id).subscribe({
          next: () => {
            this.notificationService.success('Dépôt supprimé avec succès');
            this.loadDepots();
          },
          error: (error) => {
            console.error('Error deleting depot:', error);
            let errorMessage = 'Erreur lors de la suppression du dépôt';

            if (error.status === 400 && error.error?.details?.message) {
              errorMessage =
                error.error.details.message +
                ". Vous devez d'abord supprimer les données associées.";
            } else if (error.status === 404) {
              errorMessage = 'Dépôt non trouvé';
            } else if (error.status === 500) {
              errorMessage = 'Erreur serveur lors de la suppression';
            } else if (error.error?.error) {
              errorMessage = error.error.error;
            }

            this.notificationService.error(
              'Erreur de suppression',
              errorMessage
            );
          },
        });
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  importDepots() {
    if (this.selectedFile) {
      this.depotService.importDepots(this.selectedFile).subscribe({
        next: (response) => {
          console.log('Import successful:', response);
          this.loadDepots();
          this.selectedFile = null;
        },
        error: (error) => console.error('Error importing depots:', error),
      });
    }
  }
}
