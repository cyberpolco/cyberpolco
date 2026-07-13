import Image from "next/image";
import { clients } from "@/lib/content/clients";

export default function ClientLogos() {
  const track = [...clients, ...clients];

  return (
    <div className="logo-marquee mx-auto max-w-2xl">
      <div className="logo-marquee-track">
        {track.map((client, i) => (
          <div key={`${client.name}-${i}`} className="flex w-[230px] flex-none flex-col items-center gap-3">
            <div className="flex h-28 w-full items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
              <Image
                src={client.logo}
                alt={client.name}
                width={200}
                height={96}
                className="h-24 w-auto object-contain"
              />
            </div>
            <p className="text-center text-sm font-medium text-white/80">{client.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
