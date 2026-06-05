from dataclasses import dataclass
from urllib import robotparser


@dataclass
class RobotsPolicy:
    robots_url: str
    text: str

    def can_fetch(self, url: str, user_agent: str = "DiraNewsBot") -> bool:
        parser = robotparser.RobotFileParser()
        parser.set_url(self.robots_url)
        parser.parse(self.text.splitlines())
        return parser.can_fetch(user_agent, url)

