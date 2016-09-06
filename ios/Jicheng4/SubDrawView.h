//
//  SubDrawView.h
//  Jicheng4
//
//  Created by guojicheng on 16/9/6.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>

#define PI 3.14159265358979323846

@interface SubDrawView : UIView

@property (nonatomic, strong) NSDictionary* drawData;
@property (nonatomic, assign) CGPoint transPos;

@end
