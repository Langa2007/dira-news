from .models import SourceDocumentInput, StoryCluster
from .text import keyword_set


def cluster_documents(documents: list[SourceDocumentInput], threshold: float = 0.25) -> list[StoryCluster]:
    clusters: list[list[SourceDocumentInput]] = []

    for document in documents:
        placed = False
        document_keywords = keyword_set(document.title + " " + document.text)
        for cluster in clusters:
            cluster_keywords = keyword_set(" ".join(item.title + " " + item.text for item in cluster))
            similarity = _jaccard(document_keywords, cluster_keywords)
            if similarity >= threshold:
                cluster.append(document)
                placed = True
                break
        if not placed:
            clusters.append([document])

    return [
        StoryCluster(
            id=f"cluster-{index + 1}",
            title=_cluster_title(cluster),
            document_ids=[document.id for document in cluster],
            score=round(len(cluster) / max(len(documents), 1), 4),
        )
        for index, cluster in enumerate(clusters)
    ]


def _jaccard(left: set[str], right: set[str]) -> float:
    if not left and not right:
        return 0
    return len(left & right) / len(left | right)


def _cluster_title(cluster: list[SourceDocumentInput]) -> str:
    return cluster[0].title if cluster else "Untitled cluster"

