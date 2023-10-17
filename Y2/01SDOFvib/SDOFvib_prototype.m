%SDOFvib prototype
clear all
close all
clc

%input data
m=1;
k=5000;
c=200;

%calculations and definitions
ccrit=2*sqrt(k*m); %critical damping
c=0.1*ccrit;
zeta=c/ccrit; %damping ratio
if zeta<1
    underdamped=1; critdamped=0; overdamped=0;
    fprintf('system is underdamped\n');
    wn=sqrt(k/m); %natural frequency [rad]
    wd=wn*sqrt(1-zeta^2); %damped natural frequency [rad]
    fd=wd/(2*pi); %damped natural frequency [Hz]
    T=1/fd; %period of 1 cycle [s]
elseif zeta==1
    underdamped=0; critdamped=1; overdamped=0;
    fprintf('system is critically damped\n');
    wn=sqrt(k/m); %natural frequency [rad]
    fd=wn/(2*pi); %damped natural frequency [Hz]
    T=1/fd; %period of 1 cycle [s]
else
    underdamped=0; critdamped=0; overdamped=1;
    fprintf('system is overdamped\n');
    wn=sqrt(k/m); %natural frequency [rad]
    fd=wn/(2*pi); %damped natural frequency [Hz]
    T=1/fd; %period of 1 cycle [s]
end

%definitions
Ncycles=10; %<--INPUT
Ttot=Ncycles*T; %total time
fs=100*fd; %Sampling frequency (> Nyquist)
dt=1/fs; %Sampling interval [s]
t=0:dt:Ttot; %time vector [s]

if underdamped
    A=1; B=0; %[initial conditions]
    Y=A*exp(-zeta*wn*t).*cos(wd*t)+...
      B*exp(-zeta*wn*t).*sin(wd*t); %result
end
if critdamped %fastest return to zero
    A=1; B=0; %[initial conditions]
    r1=(-c+sqrt(c^2-4*m*k))/(2*m);
    r2=(-c-sqrt(c^2-4*m*k))/(2*m);
    Y=A*exp(r1*t)+B*exp(r2*t); %result
end
if overdamped
    A=1; B=0;
    Y=exp(-c*t/(2*m)).*(A+B*t); %result
end

%plot
plot(t,Y)
hold all
xlabel('time [s]')
ylabel('Amplitude [mm]')


df=1/T;
ff=0:df:200;

