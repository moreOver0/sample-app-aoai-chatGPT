import {Checkbox, DefaultButton, Label, Panel, PrimaryButton, Rating, RatingSize, TextField} from "@fluentui/react";
import {useEffect, useId, useState} from "react";

import styles from "./FeedbackPanel.module.css";
import {ChatMessage, Citation, ToolMessageContent} from "../../api";
import {DocFeedback, Feedback, feedbackApi} from "../../api/feedback";

export interface IFeedbackPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
    feedbackMessageIndex: number;
    chatMessages: ChatMessage[];
}

export const FeedbackPanel: React.FC<IFeedbackPanelProps> = ({
                                                                 isOpen,
                                                                 onDismiss,
                                                                 feedbackMessageIndex,
                                                                 chatMessages,
                                                             }) => {
    const [feedback, setFeedback] = useState<Feedback>({
        overall_response_quality: 3,
        overall_document_quality: 3,
        verbatim: "",
        documentation_accuracy_relevance: "",
        inaccurate_answer: false,
        missing_info: false,
        too_long: false,
        too_short: false,
        confusing: false,
        offensive: false,
        biased: false,
        outdated: false,
        repetitive: false,
        fantastic: false,
        question_id: "",
        question: "",
        answer_id: "",
        answer: "",
        top_docs: [],
    });

    const getRoleMessage = (role: "user" | "tool" | "assistant"): ChatMessage | null => {
        for (let i = 0; i < 3; i++) {
            const searchIndex = feedbackMessageIndex - i;
            if (searchIndex >= 0 && chatMessages[searchIndex].role === role) {
                return chatMessages[searchIndex];
            }
        }

        return null;
    }

    useEffect(() => {
        let questionId = "";
        let question = "";
        let answerId = "";
        let answer = "";
        let topDocs: DocFeedback[] = [];

        if (feedbackMessageIndex >= 1) {
            let qMessage = getRoleMessage("user");
            let aMessage = getRoleMessage("assistant");
            questionId = qMessage?.id ?? "";
            question = qMessage?.content ?? "";
            answerId = aMessage?.id ?? "";
            answer = aMessage?.content ?? "";

            // Parse out citations from the "tool" role message
            const toolMessage = getRoleMessage("tool");
            if (toolMessage) {
                let citations: Citation[] = [];
                try {
                    const toolMessageContent = JSON.parse(toolMessage.content) as ToolMessageContent;
                    citations = toolMessageContent.citations;
                } catch {
                    // Failure to parse tool message, weird - but not fatal
                }

                topDocs = citations.map((d) => ({
                    title: d.title ?? "",
                    filepath: d.filepath ?? "",
                }));
            }
        }

        setFeedback({
            ...feedback,
            question_id: questionId,
            question: question,
            answer_id: answerId,
            answer: answer,
            top_docs: topDocs,
        });
    }, [isOpen]);

    const onSubmit = () => {
        void feedbackApi(feedback);
        onDismiss();
    };

    const overallRatingId = useId();
    const documentRatingId = useId();

    return (
        <Panel
            headerText="Feedback"
            isOpen={isOpen}
            isBlocking={true}
            onDismiss={onDismiss}
            closeButtonAriaLabel="Close"
            onRenderFooterContent={() => (
                <>
                    <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
                    <PrimaryButton onClick={onSubmit}>Submit</PrimaryButton>
                </>
            )}
            isFooterAtBottom={true}
        >
            <Label htmlFor={overallRatingId}>Overall response quality</Label>
            <Rating
                id={overallRatingId}
                size={RatingSize.Large}
                allowZeroStars={false}
                max={5}
                defaultRating={3}
                onChange={(_ev, rating) => setFeedback({...feedback, overall_response_quality: rating ?? 1})}
            />
            <br/>
            <Label htmlFor={documentRatingId}>Overall document quality</Label>
            <Rating
                id={documentRatingId}
                size={RatingSize.Large}
                allowZeroStars={false}
                max={5}
                defaultRating={3}
                onChange={(_ev, rating) => setFeedback({...feedback, overall_document_quality: rating ?? 1})}
            />
            <hr/>
            <TextField
                label="Answer quality"
                placeholder="Eg. The answer was accurate, but I expected it to contain information on..."
                multiline
                autoAdjustHeight
                onChange={(_ev, value) => setFeedback({...feedback, verbatim: value ?? ""})}
            />
            <TextField
                label="Expected Document URL"
                placeholder="Eg. I expected to see the answer cite a specific article. Or an unexpected article was cited. Please provide details of best references for this question."
                multiline
                autoAdjustHeight
                onChange={(_ev, value) => setFeedback({...feedback, documentation_accuracy_relevance: value ?? ""})}
            />
            <hr/>
            <Checkbox
                label="Inaccurate"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, inaccurate_answer: !!value})}
            />
            <Checkbox
                label="Missing information"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, missing_info: !!value})}
            />
            <Checkbox
                label="Too long"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, too_long: !!value})}
            />
            <Checkbox
                label="Too short"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, too_short: !!value})}
            />
            <Checkbox
                label="Confusing"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, confusing: !!value})}
            />
            <Checkbox
                label="Offensive"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, offensive: !!value})}
            />
            <Checkbox
                label="Biased"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, biased: !!value})}
            />
            <Checkbox
                label="Outdated"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, outdated: !!value})}
            />
            <Checkbox
                label="Repetitive"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, repetitive: !!value})}
            />
            <Checkbox
                label="Fantastic!"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({...feedback, fantastic: !!value})}
            />
        </Panel>
    );
};
