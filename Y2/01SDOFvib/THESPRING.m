%THE SPRING

l=2;
Lmin=3*l;
Lmax=6*l; %(2+4*sqrt(2))*l;
L0=[Lmin (Lmin+Lmax)/2 Lmax]; %Lmax=12
rgb={'r','m','b'};

aa=axes;
hold on
for ii=1:length(L0)
    alpha=2*asin((L0(ii)-2*l)/(4*sqrt(2)*l))*180/pi;
disp(alpha)
alpha=alpha*pi/180;


p0x=0; p0y=0;


p1x=p0x; p1y=p0y+l;
line(aa,[p0x,p1x],[p0y,p1y],'Color',rgb{ii}); %stem from ground

p2x=p1x-l/2*cos(alpha/2); p2y=p1y+l/2*sqrt(2)*sin(alpha/2);
line(aa,[p1x,p2x],[p1y,p2y],'Color',rgb{ii}); %to left (half)

p3x=p2x+l*cos(alpha/2); p3y=p2y+l*sqrt(2)*sin(alpha/2);
line(aa,[p2x,p3x],[p2y,p3y],'Color',rgb{ii}); %to right
p4x=p3x-l*cos(alpha/2); p4y=p3y+l*sqrt(2)*sin(alpha/2);
line(aa,[p3x,p4x],[p3y,p4y],'Color',rgb{ii}); %to left
p5x=p4x+l*cos(alpha/2); p5y=p4y+l*sqrt(2)*sin(alpha/2);
line(aa,[p4x,p5x],[p4y,p5y],'Color',rgb{ii}); %to right

p6x=p5x-l/2*cos(alpha/2); p6y=p5y+l/2*sqrt(2)*sin(alpha/2);
line(aa,[p5x,p6x],[p5y,p6y],'Color',rgb{ii}); %to left (half)

p7x=p6x; p7y=p6y+l; 
line(aa,[p6x,p7x],[p6y,p7y],'Color',rgb{ii}); %stem to mass

end
xlim([-l,+l]);
