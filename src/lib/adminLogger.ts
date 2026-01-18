import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type AdminAction = 
    | 'create_candidate'
    | 'update_candidate'
    | 'delete_candidate'
    | 'update_votes'
    | 'update_abstain'
    | 'update_spoiled'
    | 'block_user'
    | 'unblock_user'
    | 'delete_user'
    | 'create_policy'
    | 'update_policy'
    | 'delete_policy'
    | 'update_schedule'
    | 'update_live_settings';

interface LogEntry {
    action: AdminAction;
    target: string;
    details: string;
    timestamp?: any;
    adminIp?: string;
}

export async function logAdminAction(
    action: AdminAction,
    target: string,
    details: string
): Promise<void> {
    try {
        // Try to get IP
        let adminIp = "";
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            adminIp = data.ip || "";
        } catch (e) {
            console.log("Could not fetch admin IP");
        }

        const logEntry: LogEntry = {
            action,
            target,
            details,
            timestamp: serverTimestamp(),
            adminIp,
        };

        await addDoc(collection(db, "logs"), logEntry);
    } catch (error) {
        console.error("Error logging admin action:", error);
        // Don't throw - logging should not block the main action
    }
}
