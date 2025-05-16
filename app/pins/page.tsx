import Image from 'next/image';
import { cookies } from "next/headers";
import Link from 'next/link';

async function getPins() {
    const cookieStore = cookies();
    const pinterestToken = (await cookieStore).get("pinterest_token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getPins`, {
      headers: {
        Cookie: `pinterest_token=${pinterestToken}`,
      },
    });

  if (!res.ok) {
    throw new Error('Failed to fetch pins');
  }

  return res.json();
}

export default async function PinsPage() {
  const pins = await getPins();
  console.log('the pincs', JSON.stringify(pins, null, 3))

  return (
    <main className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {pins?.pins?.map((pin) => (
          <div
            key={pin.id}
            className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow"
          >
            {pin.media?.images?.["400x300"]?.url && (
              <Image
                src={pin.media.images["600x"].url}
                alt={pin.title}
                width={100}
                height={100}
                className="w-full h-auto object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold">{pin.title}</h2>
              <p className="text-sm text-gray-600">{pin.description}</p>
              {pin.link && (
                <Link
                  href={pin.link}
                  className="text-blue-500 text-sm mt-2 inline-block"
                  target="_blank"
                >
                  Visit
                </Link>
              )}
            </div>
          </div>
        ))}
    </main>
  );
}