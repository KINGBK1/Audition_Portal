'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUserData, selectAuthState, verifyToken } from "@/lib/store/features/auth/authSlice";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { MagicCard, MagicContainer } from "@/components/magicui/magic-container";

export default function AdminProfile() {
    const dispatch = useAppDispatch();
    const { userInfo } = useAppSelector(selectAuthState);
    const { push } = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        dispatch(verifyToken())
            .unwrap()
            .then((user) => {
                if (user.role !== "ADMIN") {
                    push("/");
                    console.log(user.role);
                } else {
                    dispatch(fetchUserData())
                        .unwrap()
                        .finally(() => setIsLoading(false));
                }
            })
            .catch(() => {
                push("/"); // redirect if not authenticated
                setIsLoading(false);
            });
    }, [dispatch, push]);

    function navigateToDashBoard(): void {
        push("/admin/dashboard");
    }

    return (
        <div>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="">
                    <MagicContainer className="relative z-10 dark w-[350px] flex items-center justify-center">
                        <MagicCard className="dark scale-110 w-[350px]">
                            <div className="flex items-start justify-center">
                                <Avatar className="relative top-[-40px] scale-150">
                                    <AvatarImage src={userInfo?.picture} alt="@admin" />
                                    <AvatarFallback>Pic</AvatarFallback>
                                </Avatar>
                            </div>
                            <Card className="dark">
                                <CardHeader>
                                    <CardTitle>Admin Profile</CardTitle>
                                </CardHeader>
                                <div>
                                    <CardContent>
                                        <div className="grid w-full items-center gap-4">
                                            <div className="flex flex-col space-y-1.5">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    disabled
                                                    id="name"
                                                    placeholder="Name"
                                                    value={userInfo?.username ?? ""}
                                                />
                                            </div>
                                            <div className="flex flex-col space-y-1.5">
                                                <Label htmlFor="email">Admin-Email</Label>
                                                <Input
                                                    disabled
                                                    id="email"
                                                    placeholder="Email"
                                                    value={userInfo?.email ?? ""}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex items-center justify-center">
                                        <Button variant="outline" onClick={navigateToDashBoard}>
                                            Go to Dashboard
                                        </Button>
                                    </CardFooter>
                                </div>
                            </Card>
                        </MagicCard>
                    </MagicContainer>
                    <AnimatedGridPattern
                        numSquares={30}
                        maxOpacity={0.5}
                        duration={3}
                        repeatDelay={2}
                        className={cn(
                            "[mask-image:radial-gradient(1024px_circle_at_center,white,transparent)]",
                            "h-[94%] overflow-hidden skew-y-3"
                        )}
                    />
                </div>
            )}
        </div>
    );
}
