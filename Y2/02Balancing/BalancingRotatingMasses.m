%Mass [kg]
m=[5.1 3.57 5.1];
%Radius [mm]
r=[92.3 210.8 120.5];
%Axial position [mm]
l=[-85 85 95];
%Angular positions [deg]
theta=[0 115 205];

%other inputs
%radius
RL=80; RM=80;
%axial positions
LL=0; MM=180;

%take reference
ref=LL;
refl=l-LL;

%MRL-diagram
mrlABS=m.*r.*refl;
[mrlX,mrlY]=pol2cart(theta*pi/180,mrlABS);

mrlLX=-sum(mrlX);
mrlLY=-sum(mrlY);

mrMM=sqrt(mrlLX^2+mrlLY^2)/MM*(500*2*pi)^2;
thetaMM=-atan(mrlLY/mrlLX)*180/pi;

%MR-diagram
mrABS=[m.*r mrMM];
theta=[theta thetaMM];
[mrX,mrY]=pol2cart(theta*pi/180,mrABS);

%plots
figure,
subplot(1,2,1)
title('MRL-diagram')
ax1=gca; grid minor;
xlim([min(mrlX) max(mrlX)]);
ylim([min(mrlY) max(mrlY)]);
for ii=1:length(mrlX)
    if ii-1==0
        arrow([0,0],[mrlX(ii) mrlY(ii)],14)
    else
        arrow([mrlX(ii-1) mrlY(ii-1)],[mrlX(ii) mrlY(ii)],14)
    end
end
arrow([mrlX(end) mrlY(end)],[0,0],14,'Color','m')
axis square
subplot(1,2,2)
title('MR-diagram')
ax2=gca; grid minor;
xlim([min(mrX) max(mrX)]);
ylim([min(mrY) max(mrY)]);
for ii=1:length(mrX)
    if ii-1==0
        arrow([0,0],[mrX(ii) mrY(ii)],14)
    else
        arrow([mrX(ii-1) mrY(ii-1)],[mrX(ii) mrY(ii)],14)
    end
end
arrow([mrX(end) mrY(end)],[0,0],14,'Color','m')
axis square




