// import type { Metadata } from "next"
// import { Inter } from 'next/font/google'
// import "./globals.css"
// import Navigation from '../components/Navigation'
// import Link from 'next/link'

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "CodeClub",
//   description: "A hub for students to enhance learning and productivity",
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <Navigation />
//         <main className="container mx-auto mt-8 px-4">
//           {children}
//         </main>
//         <footer className="bg-gray-200 p-4 text-center mt-8">
//           <p>&copy; 2024 CodeClub. All rights reserved.</p>
//           {/*
//           <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
//           */}
//         </footer>
//       </body>
//     </html>
//   )
// }


import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import Navigation from '../components/Navigation'
import Link from 'next/link'
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeClub",
  description: "A hub for students to enhance learning and productivity",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="container mx-auto mt-8 px-4">
            {children}
          </main>
          <footer className="bg-gray-200 p-4 text-center mt-8">
            <p>&copy; 2024 CodeClub. All rights reserved.</p>
            <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
          </footer>
        </Providers>
      </body>
    </html>
  )
}



