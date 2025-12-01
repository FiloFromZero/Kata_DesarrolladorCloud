import { Injectable } from '@angular/core';
import { ApprovalRequest, User, KPIData, ApprovalStatus, ApprovalType } from '../types/approval.types';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'Carlos Rodriguez',
      email: 'carlos.rodriguez@coe.com',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=3b82f6&color=fff'
    },
    {
      id: '2',
      name: 'Ana Martinez',
      email: 'ana.martinez@coe.com',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Martinez&background=10b981&color=fff'
    },
    {
      id: '3',
      name: 'Juan Perez',
      email: 'juan.perez@coe.com',
      avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=f59e0b&color=fff'
    },
    {
      id: '4',
      name: 'Maria Lopez',
      email: 'maria.lopez@coe.com',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Lopez&background=ef4444&color=fff'
    }
  ];

  private mockRequests: ApprovalRequest[] = [
    {
      id: 'req-001',
      title: 'Despliegue de Microservicio - API Gateway',
      description: 'Solicitud de despliegue del nuevo microservicio de API Gateway para el ambiente de producción. Este servicio gestionará la autenticación y autorización de todas las APIs del sistema.',
      requester: this.mockUsers[0],
      type: 'deployment',
      status: 'pending',
      createdAt: new Date('2024-11-27T10:30:00'),
      updatedAt: new Date('2024-11-27T10:30:00')
    },
    {
      id: 'req-002',
      title: 'Acceso a Base de Datos - Reporting',
      description: 'Solicitud de acceso a la base de datos de reporting para el equipo de Business Intelligence. Se requiere acceso de lectura a las tablas de ventas y clientes.',
      requester: this.mockUsers[1],
      type: 'access',
      status: 'approved',
      createdAt: new Date('2024-11-26T14:15:00'),
      updatedAt: new Date('2024-11-27T09:45:00')
    },
    {
      id: 'req-003',
      title: 'Cambio de Configuración - Servidor Web',
      description: 'Solicitud de cambio en la configuración del servidor web para optimizar el rendimiento de las aplicaciones. Se propone aumentar el timeout de conexión y habilitar compresión GZIP.',
      requester: this.mockUsers[2],
      type: 'change',
      status: 'rejected',
      createdAt: new Date('2024-11-25T16:20:00'),
      updatedAt: new Date('2024-11-26T11:30:00')
    },
    {
      id: 'req-004',
      title: 'Despliegue de Aplicación - Portal Clientes',
      description: 'Solicitud de despliegue de la nueva versión del portal de clientes con mejoras en la interfaz de usuario y nuevas funcionalidades de autogestión.',
      requester: this.mockUsers[3],
      type: 'deployment',
      status: 'pending',
      createdAt: new Date('2024-11-27T08:45:00'),
      updatedAt: new Date('2024-11-27T08:45:00')
    },
    {
      id: 'req-005',
      title: 'Acceso a Recursos - Servidor de Archivos',
      description: 'Solicitud de acceso al servidor de archivos compartidos para el departamento de Recursos Humanos. Se necesita acceso para gestionar documentos de personal.',
      requester: this.mockUsers[0],
      type: 'access',
      status: 'pending',
      createdAt: new Date('2024-11-27T11:00:00'),
      updatedAt: new Date('2024-11-27T11:00:00')
    }
  ];

  getApprovalRequests(): ApprovalRequest[] {
    return this.mockRequests;
  }

  getKPIData(): KPIData {
    const pending = this.mockRequests.filter(req => req.status === 'pending').length;
    const processed = this.mockRequests.filter(req => req.status !== 'pending').length;
    
    return {
      pendingApprovals: pending,
      totalProcessed: processed,
      averageTime: '2.5 días'
    };
  }

  updateRequestStatus(requestId: string, status: ApprovalStatus, comments?: string): void {
    const request = this.mockRequests.find(req => req.id === requestId);
    if (request) {
      request.status = status;
      request.updatedAt = new Date();
      
    }
  }
}