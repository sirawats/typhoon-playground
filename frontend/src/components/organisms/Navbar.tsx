'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useAuthStore } from '@/store/auth';

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const initials =
    user?.fullName
      ?.split(' ')
      .map((name) => name.charAt(0))
      .join('') ?? '?';

  return (
    <nav className="flex h-16 items-center justify-between border-b border-gray-800 bg-background px-8">
      <div className="flex items-center gap-2">
        <Image src="/typhoon-logo.svg" alt="Typhoon" width={32} height={32} />
        <span className="text-h3 font-semibold text-white">TYPHOON</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="https://docs.opentyphoon.ai/"
          target="_blank"
          className="rounded-full border border-primary p-2 px-6 text-btn text-white hover:text-primary"
        >
          Docs
        </Link>

        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary">
              <span className="flex h-full items-center justify-center text-h4">
                {initials}
              </span>
            </div>
            <span className="text-button text-white">{user?.fullName}</span>
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 py-1 shadow-lg">
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={logout}
                  className={`${focus ? 'bg-gray-700' : ''} w-full px-4 py-2 text-left text-sm text-white`}
                >
                  Sign out
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </nav>
  );
}
