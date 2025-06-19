//MQNLZPRM JOB
//******************************************************************
//*                                                                *
//* <copyright                                                     *
//* notice="lm-source"                                             *
//* pids="5655-MQ9"                                                *
//* years="1993,2018"                                              *
//* crc="10952376" >                                               *
//* Licensed Materials - Property of IBM                           *
//*                                                                *
//* 5655-MQ9                                                       *
//*                                                                *
//* (C) Copyright IBM Corp. 1993, 2018 All Rights Reserved.        *
//* </copyright>                                                   *
//*                                                                *
//******************************************************************
//*                                                                *
//* IBM MQ for z/OS                                                *
//*                                                                *
//* This job assembles and links a new system parameter module.    *
//*                                                                *
//* Edit the parameters for the CSQ6LOGP, CSQ6ARVP, CSQ6SYSP and   *
//* CSQ6USGP macros to determine your system parameters.           *
//*                                                                *
//******************************************************************
//*                                                                *
//* MORE INFORMATION                                               *
//*                                                                *
//* For more information about the system parameters refer to the  *
//* IBM Knowledge Center.                                          *
//*                                                                *
//******************************************************************
//*
//* CUSTOMIZE THIS JOB HERE FOR YOUR INSTALLATION
//* YOU MUST DO GLOBAL CHANGES ON THESE PARAMETERS USING YOUR EDITOR
//*
//*    Replace   ANTZ.MQ.V9XX.DFCT.OUT
//*                      with the high level qualifier of the
//*                      SCSQMACS and SCSQAUTH target libraries.
//*
//*    Replace   VICY.MQNL.LOADLIB
//*                      with the data set name of the authorized
//*                      load library in which to store your
//*                      system parameter module.
//*
//*    Replace   ++NAME++
//*                      with the name of your system parameter
//*                      module.
//*                      Note - do NOT use the default version
//*                      name of CSQZPARM if you are using the
//*                      IBM library SCSQAUTH to store your
//*                      system parameter module.
//*
//******************************************************************
//*
//*             Assemble step for CSQ6LOGP
//*
//* EXAMPLE COMMENT CONTAINING LOGLOAD=500000
//* LOGLOAD=500000
//*
//LOGP   EXEC PGM=ASMA90,PARM='DECK,NOOBJECT,LIST,XREF(SHORT)',
//             REGION=4M
//SYSLIB   DD DSN=ANTZ.MQ.V9XX.DFCT.OUT.SCSQMACS,DISP=SHR
//         DD DSN=SYS1.MACLIB,DISP=SHR
//SYSUT1   DD UNIT=SYSDA,SPACE=(CYL,(1,1))
//SYSPUNCH DD DSN=&&LOGP,
//            UNIT=SYSDA,DISP=(,PASS),
//            SPACE=(400,(100,100,1))
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
         CSQ6LOGP INBUFF=60,         ARCHIVE LOG BUFFER SIZES (KB)     X
               OUTBUFF=4000,          - INPUT AND OUTPUT               X
               MAXRTU=2,             MAX ALLOCATED ARCHIVE LOG UNITS   X
               DEALLCT=0,            ARCHIVE LOG DEALLOCATE INTERVAL   X
               OFFLOAD=YES,          ARCHIVING ACTIVE                  X
               MAXARCH=500,          MAX ARCHIVE LOG VOLUMES           X
               TWOACTV=YES,          DUAL ACTIVE LOGGING               X
               TWOARCH=YES,          DUAL ARCHIVE LOGGING              X
               TWOBSDS=YES,          DUAL BSDS                         X
               COMPLOG=NONE,         LOG COMPRESSION                   X
               WRTHRSH=20,           ACTIVE LOG BUFFERS                X
               ZHYWRITE=NO           ZHYPERWRITE ENABLED
         END
/*
//*
//*             Assemble step for CSQ6ARVP
//*
//ARVP   EXEC PGM=ASMA90,COND=(0,NE),
//             PARM='DECK,NOOBJECT,LIST,XREF(SHORT)',
//             REGION=4M
//SYSLIB   DD DSN=ANTZ.MQ.V9XX.DFCT.OUT.SCSQMACS,DISP=SHR
//         DD DSN=SYS1.MACLIB,DISP=SHR
//SYSUT1   DD UNIT=SYSDA,SPACE=(CYL,(1,1))
//SYSPUNCH DD DSN=&&ARVP,
//            UNIT=SYSDA,DISP=(,PASS),
//            SPACE=(400,(100,100,1))
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
         CSQ6ARVP ALCUNIT=BLK,       UNITS FOR PRIQTY/SECQTY           X
               ARCPFX1=CSQARC1,      DSN PREFIX FOR ARCHIVE LOG 1      X
               ARCPFX2=CSQARC2,      DSN PREFIX FOR ARCHIVE LOG 2      X
               ARCRETN=30,           ARCHIVE LOG RETENTION (DAYS)      X
               ARCWRTC=(1,3,4),      ARCHIVE WTO ROUTE CODE            X
               ARCWTOR=YES,          PROMPT BEFORE ARCHIVE LOG MOUNT   X
               BLKSIZE=24576,        ARCHIVE LOG BLOCKSIZE             X
               CATALOG=NO,           CATALOG ARCHIVE LOG DATA SETS     X
               COMPACT=NO,           ARCHIVE LOGS COMPACTED            X
               PRIQTY=25715,         PRIMARY SPACE ALLOCATION          X
               PROTECT=NO,           DISCRETE SECURITY PROFILES        X
               QUIESCE=5,            MAX QUIESCE TIME (SECS)           X
               SECQTY=540,           SECONDARY SPACE ALLOCATION        X
               TSTAMP=NO,            TIMESTAMP SUFFIX IN DSN           X
               UNIT=TAPE,            ARCHIVE LOG DEVICE TYPE 1         X
               UNIT2=                ARCHIVE LOG DEVICE TYPE 2
         END
/*
//*
//*             Assemble step for CSQ6SYSP
//*
//SYSP   EXEC PGM=ASMA90,COND=(0,NE),
//             PARM='DECK,NOOBJECT,LIST,XREF(SHORT)',
//             REGION=4M
//SYSLIB   DD DSN=ANTZ.MQ.V9XX.DFCT.OUT.SCSQMACS,DISP=SHR
//         DD DSN=SYS1.MACLIB,DISP=SHR
//SYSUT1   DD UNIT=SYSDA,SPACE=(CYL,(1,1))
//SYSPUNCH DD DSN=&&SYSP,
//            UNIT=SYSDA,DISP=(,PASS),
//            SPACE=(400,(100,100,1))
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
         c                                                      X
               ACELIM=0,             MAX ACE STORAGE POOL SIZE(KB)     X
               CLCACHE=STATIC,       CLUSTER CACHE TYPE                X
               CMDUSER=CSQOPR,       DEFAULT USERID FOR COMMANDS       X
               EXCLMSG=(),           NO MESSAGES EXCLUDED              X
               EXITLIM=30,           EXIT TIMEOUT (SEC)                X
               EXITTCB=8,            NUMBER OF EXIT SERVER TCBS        X
               LOGLOAD=500000,       LOG RECORD CHECKPOINT NUMBER      X
               OTMACON=(MQSERIES,,DFSYDRU0,2147483647,CSQ),   METERS   X
               QINDXBLD=WAIT,        QUEUE INDEX BUILDING              X
               QMCCSID=0,            QMGR CCSID                        X
               QSGDATA=(SQL3,DSNV12P1,DKP1,4,4),                       X
               RESAUDIT=YES,         RESLEVEL AUDITING                 X
               ROUTCDE=1,            DEFAULT WTO ROUTE CODE            X
               SMFACCT=NO,           GATHER SMF ACCOUNTING             X
               SMFSTAT=NO,           GATHER SMF STATS                  X
               SPLCAP=NO,            MESSAGE ENCRYPTION NOT REQUIRED   X
               STATIME=30,           STATISTICS RECORD INTERVAL (MIN)  X
               TRACSTR=YES,          TRACING AUTO START                X
               TRACTBL=99,           GLOBAL TRACE TABLE SIZE X4K       X
               WLMTIME=30,           WLM QUEUE SCAN INTERVAL (SEC)     X
               WLMTIMU=MINS,         WLMTIME UNITS                     X
               SERVICE=0             IBM SERVICE USE ONLY
         END
/*
//*            QSGDATA=(SQL3,DSNV12P1,DKP1,4,4),
//*            QSGDATA=(,,,,),
//*
//*             Assemble step for CSQ6USGP
//*
//USGP   EXEC PGM=ASMA90,PARM='DECK,NOOBJECT,LIST,XREF(SHORT)',
//             REGION=4M
//SYSLIB   DD DSN=ANTZ.MQ.V9XX.DFCT.OUT.SCSQMACS,DISP=SHR
//         DD DSN=SYS1.MACLIB,DISP=SHR
//SYSUT1   DD UNIT=SYSDA,SPACE=(CYL,(1,1))
//SYSPUNCH DD DSN=&&USGP,
//            UNIT=SYSDA,DISP=(,PASS),
//            SPACE=(400,(100,100,1))
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
         CSQ6USGP                                                      X
               QMGRPROD=,            Queue Manager Product Name        X
               AMSPROD=              AMS Product Name
         END
/*
//*
//*  Linkedit ARVP, LOGP, SYSP, and USGP into a
//*  system parameter module.
//*
//LKED   EXEC PGM=IEWL,COND=(4,LT),
//      PARM='SIZE=(900K,124K),RENT,NCAL,LIST,AMODE=31,RMODE=ANY'
//*
//*   APF-authorized library for the new system parameter module
//SYSLMOD  DD DSN=VICY.MQNL.LOADLIB,DISP=SHR
//*
//SYSUT1   DD UNIT=SYSDA,DCB=BLKSIZE=1024,
//            SPACE=(1024,(200,20))
//SYSPRINT DD SYSOUT=*
//ARVP     DD DSN=&&ARVP,DISP=(OLD,DELETE)
//LOGP     DD DSN=&&LOGP,DISP=(OLD,DELETE)
//SYSP     DD DSN=&&SYSP,DISP=(OLD,DELETE)
//USGP     DD DSN=&&USGP,DISP=(OLD,DELETE)
//*
//*   Load library containing the default system
//*   parameter module (CSQZPARM).
//OLDLOAD  DD DSN=ANTZ.MQ.V9XX.DFCT.OUT.SCSQAUTH,DISP=SHR
//*
//SYSLIN   DD *
   INCLUDE SYSP
   INCLUDE ARVP
   INCLUDE LOGP
   INCLUDE USGP
   INCLUDE OLDLOAD(CSQZPARM)
 ENTRY CSQZMSTR
 NAME CSQZPARM(R)                   Your system parameter module name
/*
//