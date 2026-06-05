from .models import Claim, Entity, FactTable


def build_fact_table(entities: list[Entity], claims: list[Claim]) -> FactTable:
    people_or_orgs = [entity.text for entity in entities if entity.type in {"ORG", "PERSON_OR_ORG"}]
    places = [entity.text for entity in entities if entity.type == "PLACE"]
    dates = sorted({date for claim in claims for date in claim.dates})
    what = [claim.text for claim in claims[:5]]

    return FactTable(
        who=people_or_orgs[:10],
        what=what,
        where=places[:10],
        when=dates[:10],
        claims=claims,
    )

