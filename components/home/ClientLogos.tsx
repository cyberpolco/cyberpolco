import Image from "next/image";
import { clients } from "@/lib/content/clients";

export default function ClientLogos() {
  const track = [...clients, ...clients];

  return (
    <div className="logo-marquee">
      <div className="logo-marquee-track">
        {track.map((client, i) => (
          <div key={`${client.name}-${i}`} className="logo-marquee-item">
            <Image
              src={client.logo}
              alt={client.name}
              width={140}
              height={64}
              className="h-12 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
