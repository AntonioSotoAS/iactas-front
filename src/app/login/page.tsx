import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
            <Image
              src="/img/login/iactas-logo-derecha.png"
              alt="Logo IACTAS"
              width={200}
              height={64}
              className="h-16 w-auto"
              priority
            />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden min-h-svh lg:block">
        <Image
          src="/img/login/portada-Iactas.png"
          alt="Portada IACTAS"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
      </div>
    </div>
  )
}
