import { ColumnDef } from "@tanstack/react-table"
import { ActaPendiente } from "@/store/api/actasPendientesApi"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDownloadFileByUriMutation } from "@/store/api/uploadApi"
import { IconDownload, IconEye, IconFile, IconFileText } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"

export const columns: ColumnDef<ActaPendiente>[] = [
  {
    accessorKey: "x_nom_instancia",
    header: "Instancia",
  },
  {
    accessorKey: "x_formato",
    header: "Expediente",
  },
  {
    accessorKey: "f_inicio_aud",
    header: "Fecha Inicio Audiencia",
    cell: ({ row }) => {
      const dateStr = row.getValue("f_inicio_aud") as string;
      if (!dateStr) return <span className="text-muted-foreground">N/A</span>;

      try {
        // La base de datos puede devolver "YYYY-MM-DD HH:mm:ss" o similar
        // Intentar parsear la fecha de forma robusta
        const dateObj = new Date(dateStr);
        if (isValid(dateObj)) {
          return (
            <div className="text-sm font-medium">
              {format(dateObj, "dd MMM yyyy, HH:mm", { locale: es })}
            </div>
          );
        }
        return <span>{dateStr}</span>;
      } catch {
        return <span>{dateStr}</span>;
      }
    }
  },
  {
    accessorKey: "f_descargo",
    header: "Descargo",
    cell: ({ row }) => {
      const dateStr = row.getValue("f_descargo") as string;
      if (!dateStr) return <span className="text-muted-foreground">N/A</span>;

      try {
        const dateObj = new Date(dateStr);
        if (isValid(dateObj)) {
          return (
            <div className="text-sm font-medium">
              {format(dateObj, "dd MMM yyyy, HH:mm", { locale: es })}
            </div>
          );
        }
        return <span>{dateStr}</span>;
      } catch {
        return <span>{dateStr}</span>;
      }
    }
  },
  {
    accessorKey: "x_observacion",
    header: "Observación",
  },
  {
    id: "acta_generada",
    header: () => <div className="text-center font-semibold">Acta Generada</div>,
    cell: function CellComponent({ row }) {
      const acta = row.original;
      const router = useRouter();
      const [downloadFileByUri, { isLoading }] = useDownloadFileByUriMutation();

      const handleDownload = async (uri: string | null | undefined, tipo: string) => {
        if (!uri) return;
        try {
          const result = await downloadFileByUri(uri);
          if (result.data) {
            const blobUrl = window.URL.createObjectURL(result.data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Acta_${acta.n_unico || 'generada'}_${tipo}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }
        } catch (error) {
          console.error(`Error al descargar ${tipo}:`, error);
        }
      };

      const handleGenerarActa = () => {
        sessionStorage.setItem('audienciaData', JSON.stringify({
          n_unico: acta.n_unico,
          n_incidente: acta.n_incidente,
          c_audiencia: acta.c_audiencia,
          x_formato: acta.x_formato,
          x_nom_instancia: acta.x_nom_instancia,
          f_audiencia: acta.f_inicio_aud,
          n_sala: acta.n_sala,
          x_desc_audiencia: acta.x_resolucion,
        }));
        router.push('/dashboard/generar-acta');
      };

      if (acta.acta_generada_id) {
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="w-[160px] flex items-center justify-center gap-2 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  <IconEye className="h-4 w-4" />
                  Ver acta generada
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[180px] rounded-xl shadow-lg border-slate-200">
                <DropdownMenuItem
                  disabled={!acta.acta_generada_uri}
                  onClick={() => handleDownload(acta.acta_generada_uri, 'acta')}
                  className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-50"
                >
                  <IconFileText className="mr-2 h-[18px] w-[18px] text-slate-500" />
                  Ver Acta Generada
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!acta.modelo_uri}
                  onClick={() => handleDownload(acta.modelo_uri, 'modelo')}
                  className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-50"
                >
                  <IconFile className="mr-2 h-[18px] w-[18px] text-slate-500" />
                  Ver Modelo
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!acta.transcripcion_uri}
                  onClick={() => handleDownload(acta.transcripcion_uri, 'transcripcion')}
                  className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-50"
                >
                  <IconFileText className="mr-2 h-[18px] w-[18px] text-slate-500" />
                  Ver Transcripción
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              className="w-[160px] bg-[#9e1616] hover:bg-[#851111] text-white font-semibold rounded-lg shadow-sm transition-colors"
              onClick={handleGenerarActa}
            >
              Generar acta
            </Button>
          </div>
        );
      }
    },
  },
  {
    id: "enviada_sij",
    header: () => <div className="text-center font-semibold">Enviada al SIJ</div>,
    cell: () => {
      // Según tus instrucciones, estas actas en la tabla SIJ siempre estarán pendientes de envío
      return (
        <div className="flex justify-center">
          <span className="inline-flex items-center justify-center rounded-lg bg-[#fff8e7] px-4 py-1.5 text-[13px] font-medium text-[#c48c3b] w-[150px]">
            Pendiente de envío
          </span>
        </div>
      );
    },
  },
]
