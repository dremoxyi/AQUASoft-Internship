import { apiClient } from "./API-client";

export interface AuthUser {
    id?: number
    username?: string
    email?: string
    rolename?: string
}

export interface RoleInfo {
    RoleID?: number
    RoleName?: string
}

export interface DashboardUserRecord {
    UserID: number
    UserName?: string
    Email?: string
    RoleID?: number
    Role?: RoleInfo
}

export interface DashboardHotelGroupRecord {
    HGroupId: number
    GroupName?: string
    Users?: Array<{
        UserID?: number
        UserName?: string
        Email?: string
        HotelGroupManagers?: {
            ManagerRole?: string
            MembershipStatus?: "PENDING" | "ACTIVE"
            InviteTokenExpiresAt?: string
            ActivatedAt?: string
        }
        MembershipStatus?: "PENDING" | "ACTIVE"
        InviteTokenExpiresAt?: string
        ActivatedAt?: string
        ManagerRole?: string
    }>
    Hotels?: Array<{ HotelID?: number; HotelName?: string }>
}

export interface UpdateProfileInput {
    username: string
    email: string
    password?: string
}


export function whoami() {
  return apiClient("/auth/me", {
    method: "GET",
  })
}

export function updateMe(payload: UpdateProfileInput) {
    return apiClient("/auth/me", {
        method: "PUT",
        body: JSON.stringify({
            UserName: payload.username,
            Email: payload.email,
            Password: payload.password ?? "",
        }),
    })
}

export function login(username:string,password:string){

    return apiClient("/auth/login",{
        method:"POST",
        body:JSON.stringify({
            UserName: username,
            Password: password
        })
    })

}

export function register(username:string, email:string, password:string){
    
    return apiClient("/auth/register",{
        method:"POST",
        body:JSON.stringify({
            UserName: username,
            Email: email,
            Password: password,
            RoleID:4
        })
    })
}

export function logout() {
    return apiClient("/auth/logout",{
        method:"POST",
    })
}

export function checkAvailability(domain:string, value:string) {
    
    const params = new URLSearchParams({
        d:domain ?? "",
        v:value ?? ""
    })
    return apiClient(`/auth/check?${params.toString()}`,{
        method:"GET",
    })
}