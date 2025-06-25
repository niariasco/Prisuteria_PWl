/*import React from 'react';*/


const calculateStatus = (fechaInicio, fechaFin) => {
    const today = new Date();
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (today >= startDate && today <= endDate) {
      return {
        status: 'Vigente',
        color: '#FF4D4D',
        textColor: '#FFFFFF'
      };
    } else if (today > endDate) {
      return {
        status: 'Aplicado',
        color: '#D3D3D3',
        textColor: '#666666'
      };
    } else {
      return {
        status: 'Pendiente',
        color: '#ADD8E6',
        textColor: '#0066CC'
      };
    }
  };
  // Cambio automático del banner cada 4 segundos
