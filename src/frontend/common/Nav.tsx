import { FeedsIcon, HomeIcon, ProfileIcon } from "./Icons.js"

export type NavProps = {
  active: "home" | "feeds" | "profile"
}

export default function Nav({ active }: NavProps) {
  return <nav>
    <menu role="menu">
      <li aria-selected={active === 'home'}>
        <a href="/dashboard">
          <HomeIcon />
          <span>Home</span>
        </a>
      </li>
      <li aria-selected={active === 'feeds'}>
        <a href="/feeds">
          <FeedsIcon />
          <span>Feeds</span>
        </a>
      </li>
      <li aria-selected={active === 'profile'}>
        <a href="/profile">
          <ProfileIcon />
          <span>Profile</span>
        </a>
      </li>
    </menu>
  </nav>
}