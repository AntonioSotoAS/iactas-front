/**
 * Utilidad centralizada para toast notifications
 * Permite importar toast desde cualquier lugar del proyecto
 * 
 * @example
 * import { toast } from "@/lib/toast"
 * 
 * // Toast de éxito
 * toast.success("Operación exitosa")
 * 
 * // Toast de error
 * toast.error("Ocurrió un error")
 * 
 * // Toast personalizado
 * toast("Mensaje personalizado", {
 *   icon: "ℹ️",
 *   duration: 3000,
 * })
 * 
 * // Toast de carga
 * const toastId = toast.loading("Cargando...")
 * // Luego actualizar o cerrar
 * toast.success("Completado", { id: toastId })
 */
import toast from "react-hot-toast"

export { toast }
export default toast

