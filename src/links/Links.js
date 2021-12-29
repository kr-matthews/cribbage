import "./links.css";

import gitHubImage from "./github.png";
import gitHubImageDark from "./github-dark.png";
import websiteImage from "./website-logo.svg";

function Links({ gitHubLink, themeType = "light" }) {
  const links = [
    ["Personal Website", "https://kr-matthews.github.io/", websiteImage],
    [
      "Project Repository",
      gitHubLink,
      themeType === "light" ? gitHubImage : gitHubImageDark,
    ],
  ];

  return (
    <div className="link-footer">
      {links.map(([description, url, image]) => (
        <Link key={url} description={description} url={url} image={image} />
      ))}
    </div>
  );
}

function Link({ url, image, description }) {
  return (
    <a
      href={url}
      className="link-tooltip-container"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img className="link-image" src={image} alt="" />
      <span className="link-tooltip">{description}</span>
    </a>
  );
}

export default Links;
