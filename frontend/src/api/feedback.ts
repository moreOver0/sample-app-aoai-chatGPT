export type DocFeedback = {
    title: string;
    filepath: string;
}

export type Feedback = {
    overall_response_quality: number | null;
    overall_document_quality: number | null;
    verbatim: string | null;
    documentation_accuracy_relevance: string | null;
    inaccurate_answer: boolean | null;
    missing_info: boolean | null;
    too_long: boolean | null;
    too_short: boolean | null;
    confusing: boolean | null;
    offensive: boolean | null;
    biased: boolean | null;
    outdated: boolean | null;
    repetitive: boolean | null;
    fantastic: boolean | null;
    case_number: string | null;
    question_id: string | null;
    question: string | null;
    answer_id: string | null;
    answer: string | null;
    top_docs: DocFeedback[];
}

export async function feedbackApi(feedback: Feedback): Promise<void> {
    const response = await fetch("/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(feedback),
    });

    if (response.status > 299 || !response.ok) {
        alert("Unknown error");
        throw Error("Unknown error");
    }
}
