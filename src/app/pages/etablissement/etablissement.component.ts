import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { EtablissementService } from '../../services/etablissement.service';
import { ModalService } from '../../services/modal.service';
import { Etablissement } from '../../models/article.model';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-etablissement',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule],
  templateUrl: './etablissement.component.html',
  styleUrl: './etablissement.component.css',
})
export class EtablissementComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('etablissementModalTemplate', { static: true })
  etablissementModalTemplate!: TemplateRef<any>;

  etablissements: Etablissement[] = [];
  filteredEtablissements: Etablissement[] = [];
  loading = false;
  searchTerm = '';

  // Form data for adding/editing etablissements
  isModalOpen = false;
  isEditMode = false;
  currentEtablissement: Partial<Etablissement> = {};

  // Modal animation states
  isClosingModal = false;

  // File upload
  selectedFile: File | null = null;

  // Messages
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private etablissementService: EtablissementService,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService
  ) {}

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
    if (etablissement) {
      this.isEditMode = true;
      this.currentEtablissement = { ...etablissement };
    } else {
      this.isEditMode = false;
      this.currentEtablissement = {};
    }
    this.modalService.openModal(
      this.etablissementModalTemplate,
      this.viewContainerRef
    );
  }

  closeModal() {
    this.isClosingModal = true;
    this.modalService.closeModal();

    setTimeout(() => {
      this.isModalOpen = false;
      this.isEditMode = false;
      this.currentEtablissement = {};
      this.isClosingModal = false;
    }, 300);
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
            this.showMessage('Etablissement updated successfully', 'success');
          },
          error: (error) => {
            console.error('Error updating etablissement:', error);
            this.showMessage('Error updating etablissement', 'error');
          },
        });
    } else {
      this.etablissementService
        .create(this.currentEtablissement as Etablissement)
        .subscribe({
          next: () => {
            this.loadEtablissements();
            this.closeModal();
            this.showMessage('Etablissement created successfully', 'success');
          },
          error: (error) => {
            console.error('Error creating etablissement:', error);
            this.showMessage('Error creating etablissement', 'error');
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

  deleteEtablissement(id: number) {
    const etablissement = this.etablissements.find((e) => e.id === id);
    const etablissementName = etablissement
      ? etablissement.libelle
      : 'cet établissement';

    this.confirmationService
      .confirmDelete(etablissementName)
      .subscribe((confirmed) => {
        if (confirmed) {
          this.etablissementService.delete(id).subscribe({
            next: () => {
              this.notificationService.success(
                'Établissement supprimé avec succès'
              );
              this.loadEtablissements();
            },
            error: (error) => {
              console.error('Error deleting etablissement:', error);
              let errorMessage =
                "Erreur lors de la suppression de l'établissement";

              if (error.status === 400 && error.error?.details?.message) {
                errorMessage =
                  error.error.details.message +
                  ". Vous devez d'abord supprimer les données associées.";
              } else if (error.status === 404) {
                errorMessage = 'Établissement non trouvé';
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

  importEtablissements() {
    if (this.selectedFile) {
      this.loading = true;
      this.etablissementService
        .importEtablissements(this.selectedFile)
        .subscribe({
          next: (response) => {
            console.log('Import successful:', response);
            this.notificationService.success(
              'Import réussi',
              response.message || 'Import successful'
            );
            this.loadEtablissements();
            this.selectedFile = null;
            // Reset the file input
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error importing etablissements:', error);
            let errorMessage = "Une erreur est survenue lors de l'importation.";

            if (error.error) {
              if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.message) {
                errorMessage = error.error.message;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }

            this.notificationService.error(
              "Erreur d'importation",
              errorMessage
            );
            this.loading = false;
          },
        });
    } else {
      this.notificationService.warning(
        'Fichier manquant',
        'Veuillez sélectionner un fichier CSV.'
      );
    }
  }
}
