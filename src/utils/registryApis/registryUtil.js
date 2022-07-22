export const getSubscriberUrl = (subscriberDetails = []) => {
    const subscriber = subscriberDetails?.[0];
    return `https://${subscriber?.subscriber_id}${subscriber?.network_participant[0]?.subscriber_url}`;
}