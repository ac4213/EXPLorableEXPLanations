%plane stress transformations

%% CODE
clear variables
close all
clc

global in

%inputs
in.sxx=100; %[MPa]
in.syy=-50; %[MPa]
in.txy=10; %[MPa]
in.theta=0; %[deg]

%% GUI

%get Screen WIDTH and HEIGHT (in pixels)
ScreenSize=get(0,'ScreenSize');
ScrW=ScreenSize(3);
ScrH=ScreenSize(4);
clear ScreenSize

% GUI width and height
hwidth=1024;
hheight=576;

%makeGUI
h=figure('Name','Plane Stress Transformation','WindowStyle','normal',...
    'OuterPosition',[ScrW/2-hwidth/2 ScrH/2-hheight/2 hwidth hheight],...
    'Color','default','Menubar','none','Toolbar','none',...
    'NumberTitle','off','DockControls','off','Resize','off');

%makeMENUS
NewMenu=uimenu(h,'Label','New');
HelpMenu=uimenu(h,'Label','Help');
TheoryMenu=uimenu(HelpMenu,'Label','Theory...');
AboutMenu=uimenu(h,'Label','About...');

%makeBOXES
% LL=axes(h,'ActivePositionProperty','OuterPosition',...
%     'Units','normalized','OuterPosition',[0 0 0.5 0.45],'Box','on',...
%     'Tag','LL','NextPlot','add');
% xlabel(LL,'ciao');
% ylabel(LL,'ciao');
% grid(LL,'on');
% title(LL,'Stress State');
inxx = uicontrol('Style', 'edit',...
    'String','100',...
    'Units','normalized','OuterPosition', [0.05 0.40 0.05 0.05],...
    'Callback', @changexx,'Tag','sxx');
inyy = uicontrol('Style', 'edit',...
    'String','-50',...
    'Units','normalized','OuterPosition', [0.04 0.35 0.05 0.05],...
    'Callback', @changeyy,'Tag','syy');
inxy = uicontrol('Style', 'edit',...
    'String','10',...
    'Units','normalized','OuterPosition', [0.03 0.30 0.05 0.05],...
    'Callback', @changexy,'Tag','sxy');
inth = uicontrol('Style', 'edit',...
    'String','0',...
    'Units','normalized','OuterPosition', [0.02 0.25 0.05 0.05],...
    'Callback', @changeth,'Tag','theta');



%makeINFINITESIMAL
UL=axes(h,'ActivePositionProperty','OuterPosition',...
    'Units','normalized','OuterPosition',[0 0.55 0.5 0.45],'Box','on',...
    'Color','none','XColor','k','YColor','k','Clipping','off',...
    'XLimMode','manual','YLimMode','manual','ZLimMode','manual',...
    'DataAspectRatioMode','manual','PlotBoxAspectRatioMode','manual',...
    'DataAspectRatio',[1 1 1],'PlotBoxAspectRatio',[1 1 1],'Tag','UL',...
    'NextPlot','add');
axis(UL,'square'); title('Stress Element')
xlim(UL,[-2,2]);
ylim(UL,[-2,2]);

rect.vertices=[-1,-1;1,-1;1,1;-1,1]; rect.faces=[1 2 3 4];
alpha = 0; R=[cos(alpha) sin(alpha);-sin(alpha) cos(alpha)];
infi=patch(UL,rect,'Vertices',rect.vertices*R,'FaceColor',[1 1 0.9],...
    'LineWidth',2);

slider = uicontrol('Style', 'slider',...
    'Min',-180,'Max',180,'Value',0,...
    'Units','normalized','SliderStep',[1/360*5 1/36*5],...
    'Position', [0.1 0.5 0.3 0.05],...
    'Callback', @changeslider,'Tag','slider');

mohr=axes(h,'ActivePositionProperty','OuterPosition','Tag','mohr',...
    'Units','normalized','OuterPosition',[1/2 0 1/2 1],'Box','on',...
    'NextPlot','add');
axis(mohr,'equal'); title('Mohr''s Circle')

%calculations(in);

function calculations(in)
%disp(in)
sxx=in.sxx; %[MPa]
syy=in.syy; %[MPa]
txy=in.txy; %[MPa]
theta=in.theta; %[deg]

%stressfunctions
sigxx=@(sxx,syy,txy,theta)(sxx+syy)/2+(sxx-syy)/2*cos(2*theta*pi/180)+txy*sin(2*theta*pi/180);
sigyy=@(sxx,syy,txy,theta)(sxx+syy)/2-(sxx-syy)/2*cos(2*theta*pi/180)-txy*sin(2*theta*pi/180);
tauxy=@(sxx,syy,txy,theta)-(sxx-syy)/2*sin(2*theta*pi/180)+txy*cos(2*theta*pi/180);

%for this angle
sxxprime=sigxx(sxx,syy,txy,theta);
syyprime=sigyy(sxx,syy,txy,theta);
txyprime=tauxy(sxx,syy,txy,theta);

%principal angle
thetaP=atan(2*txy/(sxx-syy))*180/pi;
%max shear angle
thetaS=atan(-(sxx-syy)/(2*txy))*180/pi;

%S1 and S2 and Tmax
s1=(sxx+syy)/2+sqrt(((sxx-syy)/2)^2+txy^2);
s2=(sxx+syy)/2-sqrt(((sxx-syy)/2)^2+txy^2);
tmax=(s1-s2)/2;

%Mohr's Circle
Savg=(sxx+syy)/2;
Cx=Savg; Cy=0;

%INFINITESIMAL
UL=findobj('Tag','UL'); cla(UL);
rect.vertices=[-1,-1;1,-1;1,1;-1,1]; rect.faces=[1 2 3 4];
infi=patch(UL,rect,'Vertices',rect.vertices,'FaceColor',[1 1 0.9],...
    'LineWidth',2);
axes(UL);
arr(1)=arrow([1.1,0],[2,0],'Color','g'); arr(2)=arrow([-1.1,0],[-2,0],'Color','g'); %sx
arr(3)=arrow([0,1.1],[0,2],'Color','r'); arr(4)=arrow([0,-1.1],[0,-2],'Color','r'); %sy
arr(5)=arrow([1.1,-1],[1.1,1],'Color','b'); arr(6)=arrow([-1.1,1],[-1.1,-1],'Color','b'); %txy%
arr(7)=arrow([-1,1.1],[1,1.1],'Color','b'); arr(8)=arrow([1,-1.1],[-1,-1.1],'Color','b'); %tyx
rotate(infi,[0,0,1],theta)
rotate(arr,[0,0,1],theta)

%plotMOHRCIRCLE
mohr=findobj('Tag','mohr');
cla(mohr); axes(mohr);
plot(mohr,sxx,txy,'ko',syy,-txy,'ko');%point A,B
plot(mohr,Cx,Cy,'r*')
mohr.XAxisLocation = 'origin';
mohr.YAxisLocation = 'origin';
set(mohr,'Ydir','reverse');
viscircles(mohr,[Cx Cy],tmax,'Color','k','LineWidth',1); %Circle
title(mohr,'Mohr''s Circle'); xlabel(mohr,'\sigma'); ylabel(mohr,'\tau');
xtickformat(mohr,'%d'); ytickformat(mohr,'%d');
%mohr.XTick=union(mohr.XTick,[s1 s2]);
%mohr.YTick=union(mohr.YTick,[-tmax tmax]);
%mohr.XLim=[mohr.XTick(1)-abs(mohr.XTick(1))*0.2,mohr.XTick(end)+abs(mohr.XTick(end))*0.2];

%arcs
P = plot_arc(thetaP*pi/180,0,Cx,Cy,tmax/2,'r');
set(P,'edgecolor','r','linewidth',0.5)
S = plot_arc(thetaP*pi/180,thetaP*pi/180-thetaS*pi/180,Cx,Cy,tmax/6,'g');
set(S,'edgecolor','g','linewidth',0.5)
V = plot_arc(thetaP*pi/180,thetaP*pi/180-2*theta*pi/180,Cx,Cy,tmax/3,'b');
set(V,'edgecolor','b','linewidth',0.5)

line(mohr,[sxx syy],[txy -txy],'Color','r','LineStyle','-'); %Zero Diameter
line(mohr,[sxxprime syyprime],[txyprime -txyprime],'Color','b','LineStyle','-'); %Rolling Diameter
%line(mohr,[s2 s1],[0 0],'Color','c','LineStyle','-'); %Principal Diameter
line(mohr,[Cx Cx],[-tmax tmax],'Color','k','LineStyle','--'); %Tmax Diameter

end

function changeslider(source,~)
global in
in.theta=source.Value;
tt=findobj('Tag','theta');
tt.String=num2str(source.Value);
calculations(in);
end
function changeth(source,~)
global in
in.theta=str2double(source.String);
tt=findobj('Tag','slider');
tt.Value=str2double(source.String);
calculations(in);
end
function changexx(source,~)
global in
in.sxx=str2double(source.String);
calculations(in);
end
function changeyy(source,~)
global in
in.syy=str2double(source.String);
calculations(in);
end
function changexy(source,~)
global in
in.txy=str2double(source.String);
calculations(in);
end

function P = plot_arc(a,b,h,k,r,color)
% Plot a circular arc as a pie wedge.
% a is start of arc in radians, 
% b is end of arc in radians, 
% (h,k) is the center of the circle.
% r is the radius.
% Try this:   plot_arc(pi/4,3*pi/4,9,-4,3)
% Author:  Matt Fig
t = linspace(a,b);
x = r*cos(t) + h;
y = r*sin(t) + k;
x = [x h x(1)];
y = [y k y(1)];
P = fill(x,y,color);
set(P,'facealpha',0.2)
%axis([h-r-1 h+r+1 k-r-1 k+r+1]) 
%axis square;
if ~nargout
    clear P
end
end