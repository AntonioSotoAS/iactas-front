import { ColumnDef } from "@tanstack/react-table"
import { ActaPendiente } from "@/store/api/actasPendientesApi"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDownloadFileByUriMutation } from "@/store/api/uploadApi"
import { IconDownload } from "@tabler/icons-react"
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
    id: "acciones",
    header: "Acciones",
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
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/mis-actas-generadas`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Ver actas
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Descargas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!acta.modelo_uri}
                  onClick={() => handleDownload(acta.modelo_uri, 'modelo')}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  Descargar Modelo
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!acta.transcripcion_uri}
                  onClick={() => handleDownload(acta.transcripcion_uri, 'transcripcion')}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  Descargar Transcripción
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!acta.acta_generada_uri}
                  onClick={() => handleDownload(acta.acta_generada_uri, 'acta')}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  Descargar Acta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      } else {
        return (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleGenerarActa}
          >
            Generar acta
          </Button>
        );
      }
    },
  },
]
