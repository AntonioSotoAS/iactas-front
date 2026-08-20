"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { IconFilter, IconSearch, IconChevronRight } from "@tabler/icons-react";

// Mock Data
const MOCK_REQUISITORIAS = [
  {
    id: "REQ-2026-00891",
    caduca: true,
    delito: "Robo Agravado",
    expediente: "02136-2026-0-2501-JR-PE-06",
    fechaVencimiento: "15/12/2026",
  },
  {
    id: "REQ-2026-00412",
    caduca: false,
    delito: "Homicidio Calificado",
    expediente: "04235-2024-36-2501-JR-PE-06",
    fechaVencimiento: "No aplica",
  },
  {
    id: "REQ-2026-00903",
    caduca: true,
    delito: "Tráfico Ilícito de Drogas",
    expediente: "01024-2025-12-2501-JR-PE-01",
    fechaVencimiento: "20/05/2027",
  },
  {
    id: "REQ-2026-01055",
    caduca: true,
    delito: "Extorsión",
    expediente: "05512-2026-0-2501-JR-PE-02",
    fechaVencimiento: "22/08/2026",
  }
];

export default function RequisitoriasPage() {
  const [caducaFilter, setCaducaFilter] = useState("Todos");
  const [codigoFilter, setCodigoFilter] = useState("");
  const [desdeFilter, setDesdeFilter] = useState("");
  const [hastaFilter, setHastaFilter] = useState("");
  const [delitoFilter, setDelitoFilter] = useState("");

  const handleLimpiar = () => {
    setCaducaFilter("Todos");
    setCodigoFilter("");
    setDesdeFilter("");
    setHastaFilter("");
    setDelitoFilter("");
  };

  const resultados = MOCK_REQUISITORIAS.filter(req => {
    if (delitoFilter && !req.delito.toLowerCase().includes(delitoFilter.toLowerCase())) {
      return false;
    }
    if (codigoFilter && !req.id.toLowerCase().includes(codigoFilter.toLowerCase()) && !req.expediente.toLowerCase().includes(codigoFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      {/* Filtros de Búsqueda */}
      <div className="p-6 mb-8 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center mb-4">
          <IconFilter className="text-red-700 mr-2 w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">Filtros de Búsqueda</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Filtra las requisitorias registradas según los criterios de búsqueda
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Caduca</label>
            <Select value={caducaFilter} onValueChange={setCaducaFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="3 días">Próximos 3 días</SelectItem>
                <SelectItem value="1 semana">Próxima 1 semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">N° Requisitoria / Expediente</label>
            <Input
              placeholder="Buscar por código..."
              value={codigoFilter}
              onChange={(e) => setCodigoFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Vencimiento Desde</label>
            <Input
              type="date"
              value={desdeFilter}
              onChange={(e) => setDesdeFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Vencimiento Hasta</label>
            <Input
              type="date"
              value={hastaFilter}
              onChange={(e) => setHastaFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-4">
          <Button variant="ghost" onClick={handleLimpiar} className="text-gray-600 font-semibold">
            Limpiar
          </Button>
          <Button className="bg-red-700 hover:bg-red-800 text-white font-semibold flex items-center gap-2">
            <IconSearch className="w-4 h-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Requisitorias Registradas</h3>
          <p className="text-sm text-gray-500">Mostrando {resultados.length} resultados activos</p>
        </div>
        <div className="w-full md:w-64">
          <Input
            placeholder="Filtrar por delito..."
            value={delitoFilter}
            onChange={(e) => setDelitoFilter(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resultados.map((req, index) => (
          <Card
            key={index}
            className={`rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-1 shadow-sm border-t-4 ${req.caduca ? 'border-t-red-700' : 'border-t-slate-800'
              }`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-gray-500 tracking-wide">
                  N° {req.id}
                </span>
                <Badge
                  variant="secondary"
                  className={`${req.caduca ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                    } font-semibold flex items-center gap-1.5 px-3 py-1`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${req.caduca ? 'bg-red-700' : 'bg-slate-400'}`} />
                  Caduca: {req.caduca ? "Sí" : "No"}
                </Badge>
              </div>

              <h4 className="text-lg font-bold text-gray-900 mb-6">{req.delito}</h4>

              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Expediente</span>
                <span className="text-sm font-semibold text-gray-700">{req.expediente}</span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-500">F. Vencimiento</span>
                <span className={`text-sm ${req.caduca ? 'font-bold text-gray-900' : 'font-medium text-gray-500 italic'}`}>
                  {req.fechaVencimiento}
                </span>
              </div>
              <div className="flex justify-end mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full text-red-700 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-800 font-medium px-4 h-9 shadow-sm transition-all">
                      Ver detalle
                      <IconChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-0 rounded-[1.5rem] overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-50">
                      <DialogTitle className="text-xl font-semibold text-slate-800">Detalle de requisitoria</DialogTitle>
                      <DialogDescription className="text-xs font-medium text-slate-500 mt-1.5">
                        Req. N° {req.id.replace('REQ-', '').replace('-', '')}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2.5 px-6 py-2">
                      <div className="bg-[#f8fafc] p-3.5 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expediente</p>
                        <p className="text-[15px] font-medium text-slate-800">{req.expediente}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-[#f8fafc] p-3.5 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">DNI</p>
                          <p className="text-[15px] font-medium text-slate-800">45678901</p>
                        </div>
                        <div className="bg-[#f8fafc] p-3.5 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">N° REQ.</p>
                          <p className="text-[15px] font-medium text-slate-800">{req.id.replace('REQ-', '').replace('-', '')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-[#f8fafc] p-3.5 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">F. INICIO</p>
                          <p className="text-[15px] font-medium text-slate-800">2026-06-03</p>
                        </div>
                        <div className="bg-[#f8fafc] p-3.5 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">F. VENCIMIENTO</p>
                          <p className="text-[15px] font-medium text-slate-800">{req.fechaVencimiento}</p>
                        </div>
                      </div>

                      <div className="bg-[#f8fafc] p-3.5 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">CADUCA</p>
                        <p className="text-[15px] font-medium text-slate-800">{req.caduca ? "Sí" : "No"}</p>
                      </div>

                      <div className="bg-[#fffbeb] p-3.5 rounded-2xl">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">DELITO</p>
                        <p className="text-[15px] font-medium text-slate-800">{req.delito}</p>
                      </div>
                    </div>

                    <div className="flex justify-end px-6 pb-6 pt-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="rounded-full px-7 h-10 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium shadow-sm transition-all">
                          Cerrar
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
